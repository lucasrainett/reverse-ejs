/**
 * EJS-compatible template tokenizer.
 *
 * The splitting and state-machine logic is a faithful TypeScript port of
 * EJS's internal scan pipeline (Template.scan / scanLine / _addOutput).
 * Ported from https://github.com/mde/ejs (Apache License 2.0).
 */

import { Token, EjsOptions } from './types'

// ─── Delimiter helpers ────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Build the split regex for the given delimiter set — matches EJS _REGEX_STRING. */
function buildEjsRe(o: string, d: string, c: string): RegExp {
  const alts = [
    o+d+d, d+d+c,                              // <%% %%>
    o+d+'=', o+d+'-', o+d+'_', o+d+'#', o+d,  // open tags
    '-'+d+c, '_'+d+c, d+c,                     // close tags
  ].map(esc)
  return new RegExp(`(${alts.join('|')})`)
}

/** Map each raw delimiter string to a canonical segment type. */
function buildSegMap(o: string, d: string, c: string): Map<string, string> {
  return new Map([
    [o+d+d,   'OPEN_LITERAL'],   // <%%
    [d+d+c,   'CLOSE_LITERAL'],  // %%>
    [o+d+'=', 'OPEN_ESCAPED'],   // <%=
    [o+d+'-', 'OPEN_RAW'],       // <%-
    [o+d+'_', 'OPEN_SLURP'],     // <%_
    [o+d+'#', 'OPEN_COMMENT'],   // <%#
    [o+d,     'OPEN'],           // <%
    [d+c,     'CLOSE'],          // %>
    ['-'+d+c, 'CLOSE_NEWLINE'],  // -%>
    ['_'+d+c, 'CLOSE_SLURP'],    // _%>
  ])
}

// ─── Control-flow regexes ─────────────────────────────────────────────────────

// arr.forEach(item => {   or   arr.map(item => {   (with optional 2nd arg)
const FOR_EACH_RE =
  /^([\w.]+)\.(forEach|map)\s*\(\s*\(?\s*(\w+)\s*(?:,\s*\w+\s*)?\)?\s*=>\s*\{/

// Chained: items.filter(…).forEach(item => {   — base object must be a plain name
const CHAINED_RE =
  /^(\w+)\b.*\.(forEach|map)\s*\(\s*\(?\s*(\w+)\s*(?:,\s*\w+\s*)?\)?\s*=>\s*\{/

// for (const item of arr) {
const FOR_OF_RE =
  /^for\s*\(\s*(?:const|let|var)\s+(\w+)\s+of\s+([\w.]+)\s*\)/

// for (let i = 0; i < arr.length; i++) {
const FOR_CLASSIC_RE =
  /^for\s*\(\s*(?:let|var|const)\s+(\w+)[^;]*;\s*(\w+)\s*<\s*([\w.]+)\.length/

// for (const key in obj) {
const FOR_IN_RE =
  /^for\s*\(\s*(?:const|let|var)\s+(\w+)\s+in\s+([\w.]+)\s*\)/

// while (arr.length) {
const WHILE_RE = /^while\s*\(\s*([\w.]+)\.length\s*\)/

// switch (expr) {
const SWITCH_RE = /^switch\s*\(/

// case "value":   or   case 42:
const CASE_RE = /^case[\s(]/

// default:
const DEFAULT_RE = /^default\s*:/

// if (...)
const IF_RE = /^if\s*\(/

// } else if (...) {   — checked BEFORE else
const ELSE_IF_RE = /^\}\s*else\s+if\s*\(/

// } else {
const ELSE_RE = /^\}\s*else\s*\{/

// ─── Stack entry type ─────────────────────────────────────────────────────────

type StackEntry = 'loop' | 'if' | { kind: 'switch'; caseSeen: boolean }

// ─── Public API ───────────────────────────────────────────────────────────────

type Mode = 'EVAL' | 'ESCAPED' | 'RAW' | 'COMMENT' | 'LITERAL' | null

export function tokenize(template: string, opts?: EjsOptions): Token[] {
  const o = opts?.openDelimiter  ?? '<'
  const d = opts?.delimiter      ?? '%'
  const c = opts?.closeDelimiter ?? '>'

  const ejsRe  = buildEjsRe(o, d, c)
  const segMap = buildSegMap(o, d, c)

  // ── rmWhitespace (mirrors EJS option) ────────────────────────────────────
  let text = template
  if (opts?.rmWhitespace) {
    text = text.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '')
  }

  // ── EJS whitespace-slurp preprocessing (Template.scan) ───────────────────
  const oe = esc(o), de = esc(d), ce = esc(c)
  const preprocessed = text
    .replace(new RegExp(`[ \\t]*${oe+de}_`, 'gm'), o+d+'_')
    .replace(new RegExp(`_${de+ce}[ \\t]*`, 'gm'), '_'+d+c)

  // ── Split and run state machine ───────────────────────────────────────────
  const segments = preprocessed.split(ejsRe)

  const tokens: Token[]      = []
  const stack:  StackEntry[] = []

  let mode: Mode = null
  let truncate   = false
  let codeBuf    = ''

  for (const seg of segments) {
    const st = segMap.get(seg) ?? 'TEXT'

    switch (st) {

      case 'OPEN':
      case 'OPEN_SLURP':
        mode = 'EVAL'; codeBuf = ''; break

      case 'OPEN_ESCAPED':
        mode = 'ESCAPED'; codeBuf = ''; break

      case 'OPEN_RAW':
        mode = 'RAW'; codeBuf = ''; break

      case 'OPEN_COMMENT':
        mode = 'COMMENT'; codeBuf = ''; break

      case 'OPEN_LITERAL':
        // <%%  →  literal <%  (the o+d part)
        emitLiteral(tokens, o+d, truncate)
        truncate = false
        mode     = 'LITERAL'
        break

      case 'CLOSE_LITERAL':
        // %%>  →  literal %>  (the d+c part)
        emitLiteral(tokens, d+c, truncate)
        truncate = false
        mode     = 'LITERAL'
        break

      case 'CLOSE':
      case 'CLOSE_NEWLINE':
      case 'CLOSE_SLURP':
        if (mode === 'LITERAL') {
          emitLiteral(tokens, seg, truncate)
        } else if (mode === 'EVAL') {
          processScriptlet(codeBuf.trim(), tokens, stack)
        } else if (mode === 'ESCAPED') {
          emitVariable(tokens, codeBuf.trim())
        } else if (mode === 'RAW') {
          emitRawVariable(tokens, codeBuf.trim())
        }
        truncate = (st === 'CLOSE_NEWLINE' || st === 'CLOSE_SLURP')
        mode     = null
        codeBuf  = ''
        break

      default: // TEXT
        if (mode === null || mode === 'LITERAL') {
          emitLiteral(tokens, seg, truncate)
          truncate = false
        } else if (mode !== 'COMMENT') {
          codeBuf += seg
        }
        break
    }
  }

  return tokens
}

// ─── Emit helpers ─────────────────────────────────────────────────────────────

function emitLiteral(tokens: Token[], text: string, truncate: boolean): void {
  const value = truncate ? text.replace(/^(?:\r\n|\r|\n)/, '') : text
  if (value) tokens.push({ type: 'literal', value })
}

function emitVariable(tokens: Token[], raw: string): void {
  if (!raw) return
  // Strip EJS locals-object prefix: locals.name → name
  const name = raw.startsWith('locals.') ? raw.slice('locals.'.length) : raw
  if (name) tokens.push({ type: 'variable', name })
}

function emitRawVariable(tokens: Token[], raw: string): void {
  if (!raw) return
  // Dynamic include filenames (no quotes) are not reversible
  if (/^include\s*\(\s*[^'"]/.test(raw)) {
    throw new Error('Dynamic include filenames are not supported. Use a quoted string: include("filename")')
  }
  const name = raw.startsWith('locals.') ? raw.slice('locals.'.length) : raw
  if (name) tokens.push({ type: 'variable', name })
}

// ─── Scriptlet dispatcher ─────────────────────────────────────────────────────

function processScriptlet(
  code:   string,
  tokens: Token[],
  stack:  StackEntry[],
): void {
  if (!code) return

  // ── Array-method loops ────────────────────────────────────────────────────

  // arr.forEach(item => {  or  arr.map(item => {
  const feMatch = FOR_EACH_RE.exec(code)
  if (feMatch) {
    stack.push('loop')
    tokens.push({ type: 'loop_start', arrayName: feMatch[1], itemName: feMatch[3] })
    return
  }

  // Chained: items.filter(…).forEach(item => {
  const chainedMatch = CHAINED_RE.exec(code)
  if (chainedMatch) {
    stack.push('loop')
    tokens.push({ type: 'loop_start', arrayName: chainedMatch[1], itemName: chainedMatch[3] })
    return
  }

  // for (const item of arr)
  const foMatch = FOR_OF_RE.exec(code)
  if (foMatch) {
    stack.push('loop')
    tokens.push({ type: 'loop_start', arrayName: foMatch[2], itemName: foMatch[1] })
    return
  }

  // Classic for: for (let i = 0; i < arr.length; i++)
  const fcMatch = FOR_CLASSIC_RE.exec(code)
  if (fcMatch && fcMatch[1] === fcMatch[2]) {
    // fcMatch[1]=loopVar  fcMatch[2]=comparisonVar  fcMatch[3]=arrayName
    const loopVar   = fcMatch[1]
    const arrayName = fcMatch[3]
    stack.push('loop')
    // itemName = arrayName so that arr[i] maps to the array items
    tokens.push({ type: 'loop_start', arrayName, itemName: arrayName, loopVar })
    return
  }

  // for...in
  const fiMatch = FOR_IN_RE.exec(code)
  if (fiMatch) {
    stack.push('loop')
    tokens.push({ type: 'loop_start', arrayName: fiMatch[2], itemName: fiMatch[1] })
    return
  }

  // while (arr.length)
  const whileMatch = WHILE_RE.exec(code)
  if (whileMatch) {
    stack.push('loop')
    // itemName = '' means "any single variable in the body becomes the item"
    tokens.push({ type: 'loop_start', arrayName: whileMatch[1], itemName: '' })
    return
  }

  // ── Switch / case ─────────────────────────────────────────────────────────

  if (SWITCH_RE.test(code)) {
    stack.push({ kind: 'switch', caseSeen: false })
    return
  }

  if (CASE_RE.test(code) || DEFAULT_RE.test(code)) {
    const top = stack[stack.length - 1]
    if (typeof top === 'object' && top.kind === 'switch') {
      if (!top.caseSeen) {
        top.caseSeen = true
        tokens.push({ type: 'if_start' })
      } else {
        tokens.push({ type: 'else' })
        tokens.push({ type: 'if_start' })
      }
    }
    return
  }

  // ── Conditionals ─────────────────────────────────────────────────────────

  // if (...)  — before block-end checks
  if (IF_RE.test(code)) {
    stack.push('if')
    const condMatch = /^if\s*\(\s*(\w+)\s*\)/.exec(code)
    tokens.push({ type: 'if_start', condition: condMatch?.[1] })
    return
  }

  // } else if (...)  — before } else {
  if (ELSE_IF_RE.test(code)) {
    tokens.push({ type: 'else' })
    const condMatch = /^\}\s*else\s+if\s*\(\s*(\w+)\s*\)/.exec(code)
    tokens.push({ type: 'if_start', condition: condMatch?.[1] })
    // No stack change — the existing 'if' handles the eventual closing }
    return
  }

  // } else {
  if (ELSE_RE.test(code)) {
    tokens.push({ type: 'else' })
    return
  }

  // ── Block end: } or }) ────────────────────────────────────────────────────

  if (code === '}' || code.startsWith('})')) {
    const ctx = stack.pop()
    if (ctx === 'loop') {
      tokens.push({ type: 'loop_end' })
    } else if (ctx === 'if') {
      tokens.push({ type: 'if_end' })
    } else if (typeof ctx === 'object' && ctx.kind === 'switch') {
      if (ctx.caseSeen) tokens.push({ type: 'if_end' })
    }
    return
  }

  // Unknown scriptlet — ignore (computed vars, let/const/var declarations, etc.)
}
