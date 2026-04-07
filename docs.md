# reverse-ejs — Architecture & Design Documentation

> A TypeScript library that is the **inverse of EJS**: given an EJS template and
> the rendered output string it produced, return the original data object.

```ts
import { reverseEjs } from 'reverse-ejs'

reverseEjs('Hello, <%= name %>!', 'Hello, Alice!')
// → { name: 'Alice' }
```

---

## Table of Contents

1. [Motivation & Core Idea](#1-motivation--core-idea)
2. [High-Level Pipeline](#2-high-level-pipeline)
3. [Module Reference](#3-module-reference)
    - [types.ts](#31-typests)
    - [tokenizer.ts](#32-tokenizerts)
    - [patternBuilder.ts](#33-patternbuilderts)
    - [regexBuilder.ts](#34-regexbuilderts)
    - [extractor.ts](#35-extractorts)
    - [index.ts](#36-indexts)
4. [Key Design Decisions](#4-key-design-decisions)
    - [Why port EJS's own tokenizer?](#41-why-port-ejss-own-tokenizer)
    - [Why named capture groups?](#42-why-named-capture-groups)
    - [Loop blobs — two-pass extraction](#43-loop-blobs--two-pass-extraction)
    - [Dot encoding for nested properties](#44-dot-encoding-for-nested-properties)
    - [Repeated variables → backreferences](#45-repeated-variables--backreferences)
    - [Conditional branches — suffixes + sentinels](#46-conditional-branches--suffixes--sentinels)
    - [else if chains and switch/case](#47-else-if-chains-and-switchcase)
    - [Anonymous captures for JS expressions](#48-anonymous-captures-for-js-expressions)
    - [Adjacent variables](#49-adjacent-variables)
    - [locals. prefix stripping](#410-locals-prefix-stripping)
    - [Custom delimiters](#411-custom-delimiters)
    - [rmWhitespace option](#412-rmwhitespace-option)
    - [Custom unescape function](#413-custom-unescape-function)
    - [Include expansion](#414-include-expansion)
5. [Data Flow Example — Walked Step by Step](#5-data-flow-example--walked-step-by-step)
6. [EJS Feature Coverage](#6-ejs-feature-coverage)
7. [Known Limitations](#7-known-limitations)
8. [Test Suite Organisation](#8-test-suite-organisation)
9. [Evolution — How the Design Developed](#9-evolution--how-the-design-developed)

---

## 1. Motivation & Core Idea

EJS (Embedded JavaScript) is a templating language where you write a template
like:

```ejs
<p>Welcome, <%= firstName %> <%= lastName %>!</p>
<% users.forEach(user => { %>
  <li><%= user.name %> — <%= user.role %></li>
<% }) %>
```

and call `ejs.render(template, data)` to get the rendered HTML string.

**reverse-ejs inverts this.** You already have the template and the rendered
output. You want to know what `data` was. This is useful for:

- Extracting structured data from generated HTML/text when the original data
  is unavailable.
- Testing that a render pipeline produced the right values.
- Scraping rendered pages when you own the template that produced them.
- Log analysis — a log format might be an EJS template; each log line is the
  rendered output.

The core insight is that **an EJS template, once you remove all the
JavaScript-evaluation parts, is just a pattern**. Literal text is literal text.
Variable output slots are unknowns to capture. Loops define a repeated pattern.
Conditionals define alternatives. This maps perfectly to a regular expression
with named capture groups.

The pipeline is therefore:

```
Template string
    ↓  tokenizer.ts    (EJS-aware lexer)
Token[]
    ↓  patternBuilder.ts  (recursive descent)
Pattern AST
    ↓  regexBuilder.ts
Named-capture regex string
    ↓  extractor.ts    (match + post-process)
{ key: value, ... }
```

---

## 2. High-Level Pipeline

```
reverseEjs(template, finalString, options?)
│
├─ 1. expandIncludes()   — inline <%- include("partial") %> with supplied partials
├─ 2. tokenize()         — split template into Token[]
├─ 3. buildPattern()     — Token[] → Pattern AST
├─ 4. buildRegex()       — Pattern → regex string
└─ 5. extract()          — exec regex on finalString → ExtractedObject
```

Each step has a single responsibility and is independently testable.

---

## 3. Module Reference

### 3.1 `types.ts`

Central type definitions — no logic, no imports.

**`Token`** — the output of the tokenizer. A discriminated union:

| Variant | Fields | Meaning |
|---|---|---|
| `literal` | `value: string` | Raw text segment |
| `variable` | `name: string` | A `<%= ... %>` or `<%-` output tag |
| `loop_start` | `arrayName`, `itemName`, `loopVar?` | Opening of any loop construct |
| `loop_end` | — | Closing `}` or `})` of a loop |
| `if_start` | `condition?` | Opening `if (...)` or `case:` |
| `else` | — | `} else {`, `} else if (...)`, `case:` transition, `default:` |
| `if_end` | — | Closing `}` of an if/else block or switch |

**`Pattern`** — the intermediate AST:

| Variant | Purpose |
|---|---|
| `sequence` | Ordered list of child patterns |
| `literal` | Fixed string — maps 1:1 to a token literal |
| `variable` | Named capture group in the final regex |
| `loop` | Repeated section → array in output |
| `conditional` | Regex alternation for if/else and switch/case |

**`EjsOptions`** — mirrors EJS's own options object, plus `partials` and `unescape`.

**`ExtractedObject`** — the return type: `Record<string, string | boolean | ExtractedItem[]>`.

---

### 3.2 `tokenizer.ts`

The tokenizer is a **faithful TypeScript port of EJS's own internal scan
pipeline** (`Template.scan` / `scanLine` / `_addOutput` in the EJS source).
This choice is deliberate — see [§4.1](#41-why-port-ejss-own-tokenizer).

**Delimiter construction** — rather than hard-coding `<%`, `%>` etc., the
tokenizer builds a split regex (`buildEjsRe`) and a segment lookup map
(`buildSegMap`) from the three delimiter characters (`openDelimiter`,
`delimiter`, `closeDelimiter`). This is identical to how EJS itself constructs
`_REGEX_STRING`.

**Preprocessing steps** (mirroring EJS's `Template.scan`):

1. If `rmWhitespace` is set: `.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '')`
2. `<%_` slurp: strip leading `[ \t]*` before each `<%_`
3. `_%>` slurp: strip trailing `[ \t]*` after each `_%>`

**State machine** — after splitting on `ejsRe`, iterates segments with a
`mode` variable (`null`, `EVAL`, `ESCAPED`, `RAW`, `COMMENT`, `LITERAL`).
Close tags (`%>`, `-%>`, `_%>`) trigger emission of accumulated code. `-%>` and
`_%>` set a `truncate` flag that strips one leading newline from the next
literal segment.

**Control flow detection** (`processScriptlet`) — after the state machine
emits a code string, a cascade of regex tests classifies it:

| Test | Emits |
|---|---|
| `arr.forEach(item => {` or `arr.map(item => {` | `loop_start` |
| Chained `arr.filter(…).forEach(item => {` | `loop_start` (base name extracted) |
| `for (const item of arr)` | `loop_start` |
| `for (let i = 0; i < arr.length; i++)` | `loop_start` (with `loopVar = 'i'`) |
| `for (const key in obj)` | `loop_start` |
| `while (arr.length)` | `loop_start` (itemName set to `''`) |
| `switch (expr) {` | push switch stack entry |
| `case X:` / `default:` | `if_start` (or `else + if_start` after first case) |
| `if (...)` | `if_start` |
| `} else if (...) {` | `else + if_start` (no stack change) |
| `} else {` | `else` |
| `}` or `})` | `loop_end` or `if_end` from stack |

`locals.varName` is normalised to `varName` during variable emission.
Dynamic include filenames (`include(varName)` without quotes) throw a
descriptive error before becoming a token.

---

### 3.3 `patternBuilder.ts`

A **recursive descent parser** over the `Token[]` stream. Entry point:
`buildPattern(tokens)`, which calls `parseSequence` and then assigns sequential
`condId` values to every `conditional` node (depth-first).

`parseSequence(tokens, startIndex)` returns `[Pattern, stopIndex, StopReason]`.
It accumulates parts until it hits a stop token (`loop_end`, `if_end`, `else`).

For `loop_start`: recurse to get the body, push a `loop` pattern, advance past
the `loop_end`.

For `if_start`: recurse to get the then-branch. If the stop reason was `else`,
recurse again for the else-branch, then push a `conditional` with both branches.
Otherwise push a `conditional` with only a then-branch (optional match in the
final regex).

`else if` is handled transparently: the tokenizer emits `else` + `if_start`
for each `} else if (…) {`, and the stack is not touched. From the pattern
builder's point of view this looks like an else branch that *itself* starts
with an `if_start`, building a chain of nested `conditional` nodes. The regex
builder then emits `(?:thenA|(?:thenB|elseB))` — a natural right-nested
alternation.

---

### 3.4 `regexBuilder.ts`

Converts a `Pattern` to a regex string. The two public functions are:

- **`buildRegex(pattern, itemName?, seen?, branchSuffix?, loopVar?)`** — builds
  the regex with named capture groups.
- **`buildRegexNoGroups(pattern)`** — same structure, all groups replaced with
  `[\s\S]+?`. Used for the outer loop blob capture.

**`seen: Set<string>`** — tracks capture names already emitted in the current
scope. A second use of the same variable name produces a backreference
`\k<name>` instead of a duplicate named group, which JS engines reject.

**`branchSuffix`** — when building a conditional branch, a suffix like
`_C0T` (condition 0, then-branch) or `_C0E` (else-branch) is appended to each
capture name. This prevents two alternation branches from having the same
named group, which is illegal in a JS regex. The extractor strips the suffix
when building the result key.

**`itemName`** — when building inside a loop body, restricts which variables
get a named capture:

- If `captureName === itemName` → direct item, keep as-is.
- If `captureName.startsWith(itemName + '.')` → strip prefix (e.g. `user.name`
  inside a `user` loop → capture name `name`).
- If `loopVar` is set and `captureName === arrayName[loopVar]` → bracket access
  (classic `for` loop), treat as direct item.
- Anything else → anonymous `[\s\S]+?` (loop index variable, unrelated outer
  variable, computed value).

**Invalid capture names** — if a variable name contains JS operators or
characters that are invalid in a regex group name (e.g. `?`, `*`, `[`, `(`),
it produces `[\s\S]+?` instead of a named group. This handles expressions like
`active ? "yes" : "no"` or `title.toUpperCase()` — the output still has to
match the surrounding structure, but the value cannot be recovered and is not
added to the result.

**Adjacent variables** — if two `variable` patterns appear consecutively in a
`sequence` with no literal between them, a descriptive error is thrown. The
regex would be ambiguous: `(?<a>[\s\S]+?)(?<b>[\s\S]+?)` would always give `a`
one character and `b` the rest.

---

### 3.5 `extractor.ts`

Runs the regex against `finalString` and converts named groups to a nested
object.

**`extract(pattern, finalString, opts?)`**:
1. Build regex string, compile with `s` flag (dot-all).
2. `exec` against the final string.
3. If no match → throw with regex and string in the message.
4. If match but no groups (`match.groups` is `undefined`) → return `{}`.
   This happens when every output tag was an expression, so no named groups
   were emitted at all.
5. Pass groups to `groupsToObject`.

**`groupsToObject`** walks the captured groups:

- Groups ending in `_LOOP` → post-process with `extractLoopItems`.
- Sentinel groups matching `_C\d+[TE]S` → zero-length markers used only for
  boolean extraction; skipped here.
- Groups with a `_C{id}{T|E}` branch suffix → strip suffix, unescape value,
  store under original name.
- Anything else → unescape value, store directly.

After plain values, `extractConditionBooleans` recurses through the Pattern
AST looking for `conditional` nodes that have a named `condition`. For each:
- If `_C{id}TS` (then-sentinel) is defined in groups → `condition = true`
- If `_C{id}ES` (else-sentinel) is defined → `condition = false`

**`extractLoopItems`**:
1. Build body regex *with* `itemName` and `loopVar`, so item-properties get
   named captures and index variables stay anonymous.
2. Apply `bodyRegex` globally (flag `gs`) to the captured loop section.
3. For each match:
    - If exactly one capture and it IS the item → push plain string.
    - Otherwise → build an object from captures, recursing into nested `_LOOP`
      groups.

**HTML unescaping** — the default `unescapeHtml` function maps the five standard
XML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`). A custom function
can be supplied via `opts.unescape` to handle non-standard encodings like
decimal numeric references.

---

### 3.6 `index.ts`

The public surface:

```ts
export function reverseEjs(
  template:    string,
  finalString: string,
  options?:    ReverseEjsOptions,
): ExtractedObject
```

Before tokenising, `expandIncludes` recursively replaces
`<%- include("name") %>` (and the `include("name", {...})` locals-argument
variant) with the body of the named partial from `options.partials`. Expansion
is limited to depth 20 to catch circular includes. The `INCLUDE_RE` only matches
quoted filenames; variable filenames are detected and rejected in the tokenizer.

`ReverseEjsOptions` is a re-export of `EjsOptions` from `types.ts`.

---

## 4. Key Design Decisions

### 4.1 Why port EJS's own tokenizer?

The first version of the tokenizer used a simple `TAG_REGEX = /<%(-|=|#)?\s*([\s\S]*?)\s*%>/g`
approach. This failed for several EJS features:

- `<%%` — the regex would see `<%%` as `<%` opening a tag containing `%`, then
  the following `>` would be treated as literal text.
- `-%>` and `_%>` — the modifier was embedded in the code string, requiring
  the tokenizer to post-process `code.endsWith('-')`.
- `<%_` — leading whitespace stripping had to be patched in separately.
- Custom delimiters — `TAG_REGEX` was hardcoded.

EJS's own approach is different: it **splits** the template on a regex that
matches all delimiter sequences as whole atoms, then runs a state machine over
the resulting segments. This is immune to the above issues because delimiter
sequences are never partially consumed. Porting this approach gives exact
parity for every EJS modifier, with the custom-delimiter feature coming for
free.

### 4.2 Why named capture groups?

An alternative design would enumerate variable positions and match by index.
Named groups have two decisive advantages:

1. **Self-documenting** — the captured value is directly keyed to the variable
   name. No index mapping needed.
2. **Backreferences** — when a variable appears twice in a template (e.g.
   `<%= name %>` … `<%= name %>`), the second occurrence must produce the
   *same* value. Named backreferences (`\k<name>`) express this constraint
   directly in the regex. An index-based approach would need external
   post-processing to enforce it.

### 4.3 Loop blobs — two-pass extraction

The naive approach to loops would be to build a regex like
`(?:body)*` where `body` contains named capture groups. JavaScript regex
engines reject this: a named group that appears inside a `*` quantifier
is only captured for its *last* match, and duplicate group names are illegal.

The solution is a **two-pass approach**:

1. **Outer pass** — the entire repeated section is captured as a single blob:
   ```
   (?<items_LOOP>(?:bodyNoGroups)*)
   ```
   The body regex has no named groups (all replaced with `[\s\S]+?`).

2. **Inner pass** — once the blob is extracted, `extractLoopItems` applies the
   *named* body regex globally (`gs` flags) to the blob string, collecting one
   result per iteration.

This never puts named groups inside a quantifier, so the JS engine is happy.

### 4.4 Dot encoding for nested properties

Regex capture group names must be valid JavaScript identifiers. A variable like
`user.name` is not valid. The solution is to replace every `.` with `__` for
the capture name (`user__name`) and reverse the substitution when reading
results back (`user__name` → `user.name`).

This creates a theoretical collision if a variable name contains a literal
`__` — for example `user__name` as a flat variable would encode to the same
capture name as `user.name`. In practice this is rare and is documented in the
limitations section. A more robust scheme (percent-encoding, a lookup map)
could be used if needed.

### 4.5 Repeated variables → backreferences

When the same variable `name` appears twice in a template, the second
occurrence should produce the same value as the first. This is expressed in the
regex as `\k<name>` (a named backreference). The `seen: Set<string>` parameter
in `buildRegex` tracks which names have been emitted; the second call for the
same name returns the backreference form.

This has the side effect that repeated variables with genuinely different values
in the output will cause the regex to fail — the match will not be found and an
error is thrown. This is correct behaviour: a template that repeats a variable
is asserting that both occurrences have the same value.

### 4.6 Conditional branches — suffixes + sentinels

The core challenge with `if/else` is that both branches can contain variables
with the same name. In a JS regex, two alternation branches cannot have
duplicate named groups:

```
(?:(?<name>[\s\S]+?)|(?<name>[\s\S]+?))   // ← ILLEGAL
```

The solution is a **branch suffix**: each variable in the then-branch gets
`_C{id}T` appended, and each variable in the else-branch gets `_C{id}E`:

```
(?:(?<name_C0T>[\s\S]+?)|(?<name_C0E>[\s\S]+?))
```

The extractor strips the suffix when building the result. Because only one
branch can match, exactly one of `name_C0T` and `name_C0E` will be defined;
the other will be `undefined` and is skipped.

To recover **condition booleans** (e.g. knowing that `isLoggedIn` was `true`
when the then-branch matched), zero-length **sentinel capture groups** are
injected at the start of each branch:

```
(?:(?<_C0TS>)(?<name_C0T>[\s\S]+?)|(?<_C0ES>)(?<name_C0E>[\s\S]+?))
```

`_C0TS` being defined (even as an empty string) means the then-branch matched.
The extractor checks these sentinels to set `condition: true` or `false`.

For purely literal branches — branches that produce output but contain no
variables — the sentinel is the *only* capture group in the branch. Without it,
there would be no way to distinguish which branch matched.

### 4.7 else if chains and switch/case

**`} else if (cond) {`** — the tokenizer emits `else` + `if_start(cond)` but
does **not** push to the stack. The existing `'if'` stack entry handles the
eventual closing `}`. From the pattern builder's point of view, the else-branch
of the outer `if` starts with another `if_start`, naturally building a nested
`conditional` structure:

```
conditional(cond=A) {
  thenBranch: ...
  elseBranch: conditional(cond=B) {
    thenBranch: ...
    elseBranch: ...
  }
}
```

The regex becomes `(?:thenA|(?:thenB|elseB))` — a natural right-nested
alternation that correctly matches any one of the branches.

**`switch/case`** — the tokenizer maps switch/case onto the same token stream
as if/else. A `switch` pushes a switch stack entry. The first `case:` emits
`if_start`. Each subsequent `case:` emits `else + if_start`. The closing `}`
emits `if_end`. The pattern builder sees exactly the same structure as an
if/else chain and needs no modification.

### 4.8 Anonymous captures for JS expressions

EJS allows arbitrary JS expressions in output tags:

```ejs
<p><%= active ? "Online" : "Offline" %></p>
<h1><%= title.toUpperCase() %></h1>
```

These expressions cannot be reversed — given "Online" you cannot determine that
`active` was `true` without evaluating the expression. The design decision is
to **match but not capture** these: the output still has to structurally match
the surrounding literal text, but the value is consumed by an anonymous
`[\s\S]+?` group.

The trigger for this is whether the variable name is a valid regex capture
group name. Names containing `?`, `*`, `[`, `(`, `.`, `+` and similar JS
operator characters are not valid identifiers, so they produce anonymous
captures. Plain `variableName` and dotted `user.name` forms are valid and get
named captures.

When every output tag in a template is an expression, the regex has zero named
groups. The regex still matches (confirming structural correctness), but
`match.groups` is `undefined`. The extractor handles this by returning `{}`
instead of throwing.

### 4.9 Adjacent variables

Two consecutive variables with no literal separator between them are
fundamentally ambiguous:

```ejs
<%= firstName %><%= lastName %>
```

Given the output `AliceSmith`, there is no way to know where `Alice` ends and
`Smith` begins. The lazy quantifier `[\s\S]+?` in the regex would always assign
one character to the first variable.

Rather than silently returning wrong results, `buildRegex` checks every pair of
consecutive parts in a `sequence` and throws:

```
Adjacent variables with no literal separator are ambiguous
```

This is a deliberate fail-loud choice. The alternative (allowing it and
returning potentially wrong data) would be much harder to debug.

### 4.10 `locals.` prefix stripping

When EJS is used in strict mode (`_with: false`), variables are accessed as
`locals.varName` rather than bare `varName`. The tokenizer strips this prefix
during variable emission so result keys are always the bare name, matching
what the caller would expect.

### 4.11 Custom delimiters

EJS supports overriding the three delimiter characters:

```ts
ejs.render('<?= name ?>', data, { delimiter: '?' })
ejs.render('[%= name %]', data, { openDelimiter: '[', closeDelimiter: ']' })
```

The tokenizer receives these options and calls `buildEjsRe(o, d, c)` and
`buildSegMap(o, d, c)` dynamically. The preprocessing (slurp, whitespace)
regexes also use the escaped delimiter values. This mirrors exactly how EJS
constructs its internal `_REGEX_STRING`.

### 4.12 rmWhitespace option

`rmWhitespace: true` tells EJS to strip leading and trailing whitespace from
every template line before rendering. The tokenizer applies the same two
transformations:

```ts
text = text.replace(/[\r\n]+/g, '\n')
           .replace(/^\s+|\s+$/gm, '')
```

An important subtlety: `rmWhitespace` strips per-line indentation, but it does
**not** remove the newlines between template lines. So the rendered output still
contains `\n` characters between tags — just without surrounding whitespace. A
template like:

```
  <div>
    <%= name %>
  </div>
```

produces `<div>\nAlice\n</div>` (not `<div>Alice</div>`) with `rmWhitespace: true`.

### 4.13 Custom unescape function

The default unescape function handles the five standard XML entities
(`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`). Some applications use EJS with
a custom `escape` function that produces different encodings — for example,
decimal numeric character references (`&#60;` for `<`).

The `unescape` option accepts a replacement function that is applied to every
extracted string value instead of the default. The function signature is
`(s: string) => string`.

### 4.14 Include expansion

`<%- include("partial") %>` is handled by expanding the partial's content
inline before tokenising. This is done in `index.ts` before any other
processing, so the tokenizer and pattern builder see a flat, single-string
template.

Partials are supplied by the caller via `options.partials` — a plain
`Record<string, string>`. The library has no filesystem access and makes no
attempt to load files. Nested includes (a partial that includes another) are
handled by recursive expansion up to a depth of 20.

The `include("partial", { key: value })` locals-argument syntax is supported:
the regex strips the second argument, using only the quoted filename.

Dynamic include filenames (e.g. `include(headerPath)` with a variable rather
than a string literal) are detected by checking whether the argument starts with
a quote character. If not, the tokenizer throws:

```
Dynamic include filenames are not supported. Use a quoted string: include("filename")
```

---

## 5. Data Flow Example — Walked Step by Step

**Template:**
```ejs
<% if (isAdmin) { %>
<h1>Admin: <%= name %></h1>
<% } else { %>
<h1>User: <%= name %></h1>
<% } %>
```

**Final string:**
```
<h1>Admin: Alice</h1>
```

### Step 1 — Tokenize

```
if_start  { condition: 'isAdmin' }
literal   { value: '\n<h1>Admin: ' }
variable  { name: 'name' }
literal   { value: '</h1>\n' }
else
literal   { value: '\n<h1>User: ' }
variable  { name: 'name' }
literal   { value: '</h1>\n' }
if_end
```

### Step 2 — Build Pattern

```
conditional {
  condId:     0,
  condition:  'isAdmin',
  thenBranch: sequence [
    literal('\n<h1>Admin: '),
    variable('name'),
    literal('</h1>\n'),
  ],
  elseBranch: sequence [
    literal('\n<h1>User: '),
    variable('name'),
    literal('</h1>\n'),
  ],
}
```

### Step 3 — Build Regex

```
(?:(?<_C0TS>)\n<h1>Admin: (?<name_C0T>[\s\S]+?)</h1>\n
  |(?<_C0ES>)\n<h1>User: (?<name_C0E>[\s\S]+?)</h1>\n)
```

(Simplified; actual regex is one line with `^...$` wrapper and `s` flag.)

### Step 4 — Execute

Matching against `\n<h1>Admin: Alice</h1>\n`:

```
groups: {
  _C0TS:    '',          // then-branch sentinel matched
  name_C0T: 'Alice',
  _C0ES:    undefined,
  name_C0E: undefined,
}
```

### Step 5 — Extract

- `name_C0T` → strip suffix → `name = 'Alice'`
- `_C0TS` defined + condition `'isAdmin'` → `isAdmin = true`

**Result:**
```js
{ isAdmin: true, name: 'Alice' }
```

---

## 6. EJS Feature Coverage

| Feature | Status | Notes |
|---|---|---|
| `<%= var %>` | ✅ | Named capture group |
| `<%- var %>` | ✅ | Treated identically to `<%=` for extraction |
| `<%# comment %>` | ✅ | Ignored during tokenisation |
| `<%%` | ✅ | Emits literal `<%` text |
| `%%>` | ✅ | Emits literal `%>` text |
| `-%>` newline slurp | ✅ | Strips leading newline from next literal |
| `<%_` whitespace slurp | ✅ | Strips trailing tabs/spaces from preceding literal |
| `_%>` whitespace slurp | ✅ | Strips leading tabs/spaces from next literal |
| HTML entity unescaping (`<%=`) | ✅ | `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;` |
| `forEach(item => {` | ✅ | |
| `map(item => {` | ✅ | Treated same as forEach |
| `forEach((item, idx) => {` | ✅ | Index variable treated as anonymous |
| `.filter(…).forEach(item => {` | ✅ | Base array name extracted from chain |
| `for (const item of arr)` | ✅ | |
| `for (let i = 0; i < arr.length; i++)` | ✅ | `arr[i]` access in body mapped to items |
| `for (const key in obj)` | ✅ | Keys captured as string array |
| `while (arr.length)` | ✅ | Body variables captured as array |
| `if (cond)` | ✅ | Optional regex group; condition as boolean |
| `if/else` | ✅ | Branch suffix + sentinel technique |
| `else if` chains | ✅ | Tokenizer emits else+if_start; pattern builds nested conditionals |
| `switch/case` | ✅ | Mapped to if/else chain tokens |
| `<%- include("file") %>` | ✅ | Inline expansion from `options.partials` |
| `include("file", { locals })` | ✅ | Locals argument accepted and ignored |
| Custom delimiter | ✅ | `delimiter`, `openDelimiter`, `closeDelimiter` |
| `rmWhitespace` | ✅ | Preprocessing applied before tokenisation |
| Custom `unescape` function | ✅ | Replaces built-in entity map |
| `locals.varName` prefix | ✅ | Stripped during token emission |
| JS expressions in `<%= %>` | ✅ | Anonymous match; not added to result |
| Adjacent variables | ✅ | Throws a descriptive error |
| Dynamic `include(varName)` | ✅ | Throws a descriptive error |
| Repeated variables | ✅ | Backreference enforces value consistency |
| Nested loops | ✅ | Two-pass extraction recurses |
| Variables outside a loop (siblings) | ✅ | |
| Empty loop | ✅ | Empty blob → empty array |

---

## 7. Known Limitations

**Fundamentally irreversible — by design:**

- **Arbitrary JS expressions** — `<%= price * qty %>`, `<%= name.trim() %>`,
  `<%= arr.join(', ') %>`. The output is consumed by an anonymous match; no
  key is added to the result.
- **Conditional expressions** — `<%= active ? 'yes' : 'no' %>`. Same as above.
- **Condition expressions** — `<% if (a > b) { %>`. Complex boolean conditions
  cannot be reversed from a boolean result. Only simple single-identifier
  conditions (e.g. `if (isAdmin)`) are captured as booleans.
- **Dynamic include filenames** — `<%- include(path) %>`. Throws an error.
- **Adjacent variables with no separator** — `<%= first %><%= last %>`.
  Throws an error.

**Encoding collision:**

- Variable names containing `__` (double underscore) collide with dot-encoded
  nested property names. `user__name` (flat) and `user.name` (nested) produce
  the same capture group name. In practice this is rare; avoid `__` in variable
  names if using nested properties in the same template.

**EJS features not yet implemented:**

- The `outputFunctionName` option (`echo`, `print`).
- `async` mode.
- `_with: false` (already partially handled via `locals.` stripping, but not
  a custom `localsName`).
- Complex array method chains beyond `.filter().forEach()`.

---

## 8. Test Suite Organisation

The test file (`tests/index.test.ts`) has 77 tests arranged in thematic groups.
Each group has a numbered comment header (`// ─── N. Description ───`).

| Tests | Group |
|---|---|
| 1–21 | Basic extraction (single var, multiple vars, loops, nested loops, edge cases) |
| 22–31 | EJS tag modifiers (`<%-`, `<%%`, `-%>`, `<%_`, `_%>`) |
| 32–34 | HTML entity unescaping |
| 35–38 | `for...of` and `forEach` with index |
| 39–46 | Conditionals (`if`, `if/else`, complex branches, loops inside conditionals) |
| 47–56 | Include (`partials`, nested, error cases, locals syntax) |
| 57–61 | Expressions in output tags (ternary, method call, arithmetic, bracket, nullish) |
| 62–63 | `else if` chains |
| 64 | `switch/case` |
| 65–67 | Custom delimiters |
| 68–70 | `for`, `for...in`, `while` |
| 71–72 | `.map()`, `.filter().forEach()` |
| 73 | Adjacent variables error |
| 74 | `locals.` prefix stripping |
| 75 | `rmWhitespace` option |
| 76 | Custom `unescape` function |
| 77 | Dynamic include filename error |

---

## 9. Evolution — How the Design Developed

The library was built iteratively, with tests written before implementation in
each phase.

**Phase 1 — Proof of concept.** The tokenizer used a single
`/<%(-|=|#)?\s*([\s\S]*?)\s*%>/g` regex, looping over matches and collecting
literal text between them. Only `forEach` loops were recognised. The output was
an array result; nested objects required dot-notation keys. Tests 1–21 were
written and made to pass.

**Phase 2 — EJS feature audit.** The EJS documentation was reviewed against
the test suite to identify gaps. The full list of missing features was
categorised by effort: easy (`<%-`, HTML escaping), moderate (whitespace
modifiers, `for...of`, index in `forEach`), hard (`if/else`, includes,
custom delimiters). Tests 22–41 were written first, then the tokenizer was
rewritten to use EJS's own split-and-state-machine algorithm, and
`patternBuilder`/`regexBuilder`/`extractor` were extended with conditional
support.

**Key discovery — duplicate named groups.** JavaScript (Node v22) does not
support duplicate named capture groups, even in alternation. This was
discovered by empirical testing:

```js
/(?:(?<n>a)|(?<n>b))/   // throws SyntaxError
```

The branch-suffix + sentinel technique (`_C0T` / `_C0E` / `_C0TS` / `_C0ES`)
was designed as a direct response to this constraint.

**Phase 3 — Extended loop types, switch/case, else if.** Tests 57–77 were
written covering the remaining EJS features — all specified to fail. Then the
implementation was extended:

- `else if` chains mapped to nested conditional nodes via the `else + if_start`
  token pair without stack change.
- `switch/case` mapped to the same if/else token stream via the switch stack
  entry.
- Classic `for`, `for...in`, and `while` loops added with corresponding regexes.
- `loopVar` carried through the pipeline to enable `arr[i]` body access.
- Custom delimiters: split regex and segment map built dynamically.
- `locals.` stripping, `rmWhitespace`, custom `unescape`, dynamic include
  error detection all added in one pass.
- Expression detection: `isValidCaptureName()` check in `regexBuilder`
  produces anonymous groups for JS operators; the `!match.groups` early-return
  in `extractor` handles the all-expression case.

All 77 tests pass on Node ≥ 16.

---

*This document describes the library as of the 77-test milestone.*