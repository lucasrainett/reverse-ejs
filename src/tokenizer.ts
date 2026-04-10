// Ported from https://github.com/mde/ejs (Apache License 2.0)

import type { Token, EjsOptions } from "./types";

function esc(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEjsRe(o: string, d: string, c: string): RegExp {
	const alts = [
		o + d + d,
		d + d + c,
		o + d + "=",
		o + d + "-",
		o + d + "_",
		o + d + "#",
		o + d,
		"-" + d + c,
		"_" + d + c,
		d + c,
	].map(esc);
	return new RegExp(`(${alts.join("|")})`);
}

function buildSegMap(o: string, d: string, c: string): Map<string, string> {
	return new Map([
		[o + d + d, "OPEN_LITERAL"],
		[d + d + c, "CLOSE_LITERAL"],
		[o + d + "=", "OPEN_ESCAPED"],
		[o + d + "-", "OPEN_RAW"],
		[o + d + "_", "OPEN_SLURP"],
		[o + d + "#", "OPEN_COMMENT"],
		[o + d, "OPEN"],
		[d + c, "CLOSE"],
		["-" + d + c, "CLOSE_NEWLINE"],
		["_" + d + c, "CLOSE_SLURP"],
	]);
}

const FOR_EACH_RE =
	/^([\w.]+)\.(forEach|map)\s*\(\s*(?:function\s*\(\s*(\w+)\s*(?:,\s*\w+\s*)?\)\s*\{|\(?\s*(\w+)\s*(?:,\s*\w+\s*)?\)?\s*=>\s*\{)/;
const CHAINED_RE =
	/^(\w+)\b.*\.(forEach|map)\s*\(\s*(?:function\s*\(\s*(\w+)\s*(?:,\s*\w+\s*)?\)\s*\{|\(?\s*(\w+)\s*(?:,\s*\w+\s*)?\)?\s*=>\s*\{)/;
const FOR_OF_RE = /^for\s*\(\s*(?:const|let|var)\s+(\w+)\s+of\s+([\w.]+)\s*\)/;
const FOR_CLASSIC_RE =
	/^for\s*\(\s*(?:let|var|const)\s+(\w+)[^;]*;\s*(\w+)\s*<\s*([\w.]+)\.length/;
const FOR_IN_RE = /^for\s*\(\s*(?:const|let|var)\s+(\w+)\s+in\s+([\w.]+)\s*\)/;
const WHILE_RE = /^while\s*\(\s*([\w.]+)\.length\s*\)/;
const SWITCH_RE = /^switch\s*\(/;
const CASE_RE = /^case[\s(]/;
const DEFAULT_RE = /^default\s*:/;
const IF_RE = /^if\s*\(/;
const ELSE_IF_RE = /^\}\s*else\s+if\s*\(/;
const ELSE_RE = /^\}\s*else\s*\{/;

type StackEntry = "loop" | "if" | { kind: "switch"; caseSeen: boolean };
type Mode = "EVAL" | "ESCAPED" | "RAW" | "COMMENT" | "LITERAL" | null;

export function tokenize(template: string, opts?: EjsOptions): Token[] {
	const o = opts?.openDelimiter ?? "<";
	const d = opts?.delimiter ?? "%";
	const c = opts?.closeDelimiter ?? ">";

	const ejsRe = buildEjsRe(o, d, c);
	const segMap = buildSegMap(o, d, c);

	let text = template;
	if (opts?.rmWhitespace) {
		text = text.replace(/[\r\n]+/g, "\n").replace(/^\s+|\s+$/gm, "");
	}

	const oe = esc(o),
		de = esc(d),
		ce = esc(c);
	const preprocessed = text
		.replace(new RegExp(`[ \\t]*${oe + de}_`, "gm"), o + d + "_")
		.replace(new RegExp(`_${de + ce}[ \\t]*`, "gm"), "_" + d + c);

	const segments = preprocessed.split(ejsRe);
	const tokens: Token[] = [];
	const stack: StackEntry[] = [];

	let mode: Mode = null;
	let truncate = false;
	let codeBuf = "";

	for (const seg of segments) {
		const st = segMap.get(seg) ?? "TEXT";

		switch (st) {
			case "OPEN":
			case "OPEN_SLURP":
				mode = "EVAL";
				codeBuf = "";
				break;

			case "OPEN_ESCAPED":
				mode = "ESCAPED";
				codeBuf = "";
				break;

			case "OPEN_RAW":
				mode = "RAW";
				codeBuf = "";
				break;

			case "OPEN_COMMENT":
				mode = "COMMENT";
				codeBuf = "";
				break;

			case "OPEN_LITERAL":
				emitLiteral(tokens, o + d, truncate);
				truncate = false;
				mode = "LITERAL";
				break;

			case "CLOSE_LITERAL":
				emitLiteral(tokens, d + c, truncate);
				truncate = false;
				mode = "LITERAL";
				break;

			case "CLOSE":
			case "CLOSE_NEWLINE":
			case "CLOSE_SLURP":
				if (mode === "LITERAL") {
					emitLiteral(tokens, seg, truncate);
				} else if (mode === "EVAL") {
					processScriptlet(codeBuf.trim(), tokens, stack);
				} else if (mode === "ESCAPED") {
					emitVariable(tokens, codeBuf.trim());
				} else if (mode === "RAW") {
					emitRawVariable(tokens, codeBuf.trim());
				}
				truncate = st === "CLOSE_NEWLINE" || st === "CLOSE_SLURP";
				mode = null;
				codeBuf = "";
				break;

			default:
				if (mode === null || mode === "LITERAL") {
					emitLiteral(tokens, seg, truncate);
					truncate = false;
				} else if (mode !== "COMMENT") {
					codeBuf += seg;
				}
				break;
		}
	}

	return tokens;
}

function emitLiteral(tokens: Token[], text: string, truncate: boolean): void {
	const value = truncate ? text.replace(/^(?:\r\n|\r|\n)/, "") : text;
	if (value) tokens.push({ type: "literal", value });
}

// A "plain variable" is a simple identifier or dotted path (e.g. `name`, `user.name`),
// optionally with a single trailing bracket index access (e.g. `names[i]`),
// optionally preceded by `locals.`. Anything else (operators, method calls,
// nested brackets, ternaries, etc.) is treated as an expression and skipped.
const PLAIN_VAR_RE =
	/^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*(?:\[[a-zA-Z_$][\w$]*\])?$/;

function emitVariable(tokens: Token[], raw: string): void {
	if (!raw) return;
	const name = raw.startsWith("locals.") ? raw.slice("locals.".length) : raw;
	if (!name) return;
	if (PLAIN_VAR_RE.test(name)) {
		tokens.push({ type: "variable", name });
	} else {
		tokens.push({ type: "expression_skipped", expression: raw });
	}
}

function emitRawVariable(tokens: Token[], raw: string): void {
	if (!raw) return;
	if (/^include\s*\(\s*[^'"]/.test(raw)) {
		throw new Error(
			'Dynamic include filenames are not supported. Use a quoted string: include("filename")',
		);
	}
	const name = raw.startsWith("locals.") ? raw.slice("locals.".length) : raw;
	if (!name) return;
	if (PLAIN_VAR_RE.test(name)) {
		tokens.push({ type: "variable", name, raw: true });
	} else {
		tokens.push({ type: "expression_skipped", expression: raw, raw: true });
	}
}

function processScriptlet(
	code: string,
	tokens: Token[],
	stack: StackEntry[],
): void {
	if (!code) return;

	const feMatch = FOR_EACH_RE.exec(code);
	if (feMatch) {
		stack.push("loop");
		tokens.push({
			type: "loop_start",
			arrayName: feMatch[1],
			itemName: feMatch[3] || feMatch[4],
		});
		return;
	}

	const chainedMatch = CHAINED_RE.exec(code);
	if (chainedMatch) {
		stack.push("loop");
		tokens.push({
			type: "loop_start",
			arrayName: chainedMatch[1],
			itemName: chainedMatch[3] || chainedMatch[4],
		});
		return;
	}

	const foMatch = FOR_OF_RE.exec(code);
	if (foMatch) {
		stack.push("loop");
		tokens.push({
			type: "loop_start",
			arrayName: foMatch[2],
			itemName: foMatch[1],
		});
		return;
	}

	const fcMatch = FOR_CLASSIC_RE.exec(code);
	if (fcMatch && fcMatch[1] === fcMatch[2]) {
		const loopVar = fcMatch[1];
		const arrayName = fcMatch[3];
		stack.push("loop");
		tokens.push({
			type: "loop_start",
			arrayName,
			itemName: arrayName,
			loopVar,
		});
		return;
	}

	const fiMatch = FOR_IN_RE.exec(code);
	if (fiMatch) {
		stack.push("loop");
		tokens.push({
			type: "loop_start",
			arrayName: fiMatch[2],
			itemName: fiMatch[1],
		});
		return;
	}

	const whileMatch = WHILE_RE.exec(code);
	if (whileMatch) {
		stack.push("loop");
		tokens.push({
			type: "loop_start",
			arrayName: whileMatch[1],
			itemName: "",
		});
		return;
	}

	if (SWITCH_RE.test(code)) {
		stack.push({ kind: "switch", caseSeen: false });
		const inlineCase = /case[\s(]/.exec(code.slice(code.indexOf("{")));
		if (inlineCase) {
			const top = stack[stack.length - 1];
			if (typeof top === "object" && top.kind === "switch") {
				top.caseSeen = true;
				tokens.push({ type: "if_start" });
			}
		}
		return;
	}

	if (CASE_RE.test(code) || DEFAULT_RE.test(code)) {
		const top = stack[stack.length - 1];
		if (typeof top === "object" && top.kind === "switch") {
			if (!top.caseSeen) {
				top.caseSeen = true;
				tokens.push({ type: "if_start" });
			} else {
				tokens.push({ type: "else" });
				tokens.push({ type: "if_start" });
			}
		}
		return;
	}

	// break; inside switch - ignore
	if (/^break\s*;?$/.test(code)) {
		return;
	}

	// break; case ... or break; default: (combined scriptlet)
	const breakCase =
		/^break\s*;\s*(case[\s(].*)$/.exec(code) ||
		/^break\s*;\s*(default\s*:.*)$/.exec(code);
	if (breakCase) {
		processScriptlet(breakCase[1], tokens, stack);
		return;
	}

	// break; } (end of switch, combined)
	if (/^break\s*;\s*\}/.test(code)) {
		const ctx = stack.pop();
		if (typeof ctx === "object" && ctx.kind === "switch") {
			if (ctx.caseSeen) tokens.push({ type: "if_end" });
		} else if (ctx === "loop") {
			tokens.push({ type: "loop_end" });
		} else if (ctx === "if") {
			tokens.push({ type: "if_end" });
		}
		return;
	}

	if (IF_RE.test(code)) {
		stack.push("if");
		const condMatch = /^if\s*\(\s*(\w+)\s*\)/.exec(code);
		tokens.push({ type: "if_start", condition: condMatch?.[1] });
		return;
	}

	if (ELSE_IF_RE.test(code)) {
		tokens.push({ type: "else" });
		const condMatch = /^\}\s*else\s+if\s*\(\s*(\w+)\s*\)/.exec(code);
		tokens.push({ type: "if_start", condition: condMatch?.[1] });
		return;
	}

	if (ELSE_RE.test(code)) {
		tokens.push({ type: "else" });
		return;
	}

	if (code === "}" || code.startsWith("})")) {
		const ctx = stack.pop();
		if (ctx === "loop") {
			tokens.push({ type: "loop_end" });
		} else if (ctx === "if") {
			tokens.push({ type: "if_end" });
		} else if (typeof ctx === "object" && ctx.kind === "switch") {
			if (ctx.caseSeen) tokens.push({ type: "if_end" });
		}
		return;
	}
}
