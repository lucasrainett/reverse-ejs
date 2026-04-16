import type {
	Pattern,
	LoopPattern,
	ExtractedObject,
	ExtractedItem,
	EjsOptions,
	CoercionType,
} from "./types";
import {
	buildRegex,
	buildExprIdMap,
	createNameContext,
	escapeRegex,
	type NameContext,
} from "./regexBuilder";
import { stripItemPrefix } from "./normalize";
import { ReverseEjsError } from "./errors";

const HTML_ENTITY_MAP: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	// EJS's actual output uses numeric entities for " and ' — `&#34;` and
	// `&#39;`. `&quot;` is kept for robustness against non-EJS renderers
	// and HTML that wasn't produced by EJS directly.
	"&#34;": '"',
	"&#39;": "'",
};
const HTML_ENTITY_RE = /&(?:amp|lt|gt|quot|#34|#39);/g;

function unescapeHtml(s: string): string {
	// Fast path: non-HTML workloads (log lines, CSV rows, plain emails)
	// rarely contain `&`. Skip the regex scan + allocation for those.
	if (s.indexOf("&") === -1) return s;
	// Single regex pass instead of five sequential .replace() calls.
	// For large values this is ~3-5x faster and the memory profile is
	// one allocation instead of four intermediate strings.
	return s.replace(HTML_ENTITY_RE, (m) => HTML_ENTITY_MAP[m]);
}

const BRANCH_RE = /^(.+)_C(\d+)([TE])(?:_RAW)?$/;
const SENTINEL_RE = /^_C\d+[TE]S$/;
const RAW_RE = /_RAW$/;
const EXPR_RE = /^_E(\d+)(?:_C\d+[TE])?(?:_RAW)?$/;

// The regex emits compressed names like `c0`, `c5_C0T`, `c3_LOOP`. Each name
// carries an optional suffix (`_C{id}T`, `_C{id}E`, `_LOOP`, `_RAW`) that the
// extractor parses directly. The `c{N}` base resolves to the original dotted
// name via the regex's NameContext.
function resolveBase(short: string, ctx: NameContext): string {
	return ctx.shortToOriginal.get(short) ?? short;
}

/**
 * Scan the regex source for duplicate named capture groups. A hit is
 * always a library bug (we should never emit two groups with the same
 * name), so we throw a library-bug-flavored error instead of letting V8
 * reject the regex with its generic `Invalid regular expression` message.
 */
function assertNoDuplicateGroups(regexStr: string): void {
	const seen = new Set<string>();
	const re = /\(\?<([^>]+)>/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(regexStr)) !== null) {
		if (seen.has(m[1])) {
			throw new ReverseEjsError(
				`Internal: generated regex contains duplicate named group ` +
					`"${m[1]}". This is a reverse-ejs bug — please file an ` +
					`issue at https://github.com/lucasrainett/reverse-ejs/issues ` +
					`with the template you used.`,
				{
					regex: regexStr.slice(0, 200) + " …[truncated]",
					input: "",
				},
			);
		}
		seen.add(m[1]);
	}
}

// True for non-null objects that aren't arrays or Dates — the kind we
// recurse into when walking extracted values.
function isPlainObject(v: unknown): boolean {
	return (
		v != null &&
		typeof v === "object" &&
		!Array.isArray(v) &&
		!(v instanceof Date)
	);
}

function setNested(
	obj: Record<string, unknown>,
	dottedKey: string,
	value: unknown,
): void {
	const parts = dottedKey.split(".");
	if (parts.length === 1) {
		obj[dottedKey] = value;
		return;
	}
	let current = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const key = parts[i];
		if (
			current[key] == null ||
			typeof current[key] !== "object" ||
			Array.isArray(current[key])
		) {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}
	current[parts[parts.length - 1]] = value;
}

function coerceValue(
	value: string,
	type: CoercionType,
	keyForWarning: string,
	silent?: boolean,
): unknown {
	if (type === "string") return value;
	if (type === "number") {
		const n = Number(value);
		if (Number.isNaN(n)) {
			if (!silent) {
				console.warn(
					`[reverse-ejs] Could not coerce "${value}" to number for key "${keyForWarning}" - keeping original string.`,
				);
			}
			return value;
		}
		return n;
	}
	if (type === "boolean") {
		const lower = value.toLowerCase();
		if (lower === "true") return true;
		if (lower === "false") return false;
		if (!silent) {
			console.warn(
				`[reverse-ejs] Could not coerce "${value}" to boolean for key "${keyForWarning}" - keeping original string.`,
			);
		}
		return value;
	}
	if (type === "date") {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) {
			if (!silent) {
				console.warn(
					`[reverse-ejs] Could not coerce "${value}" to date for key "${keyForWarning}" - keeping original string.`,
				);
			}
			return value;
		}
		return d;
	}
	return value;
}

function applyCoercions(
	obj: Record<string, unknown>,
	types: Record<string, CoercionType>,
	silent?: boolean,
): void {
	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				if (isPlainObject(item)) {
					applyCoercions(
						item as Record<string, unknown>,
						types,
						silent,
					);
				}
			}
		} else if (isPlainObject(value)) {
			applyCoercions(value as Record<string, unknown>, types, silent);
		} else if (typeof value === "string" && types[key] !== undefined) {
			obj[key] = coerceValue(value, types[key], key, silent);
		}
	}
}

function findLastVariableName(pattern: Pattern): string | null {
	const names: string[] = [];
	function walk(p: Pattern): void {
		if (p.type === "variable") {
			names.push(p.name);
		} else if (p.type === "sequence") {
			for (const part of p.parts) walk(part);
		} else if (p.type === "loop") {
			walk(p.body);
		} else if (p.type === "conditional") {
			walk(p.thenBranch);
			if (p.elseBranch) walk(p.elseBranch);
		}
	}
	walk(pattern);
	return names[names.length - 1] ?? null;
}

/**
 * Shape the standard mismatch error consumed by both the regex-based
 * `extract` and the fast-path walker. Keeping the construction in one
 * place means error-message asserts in the test suite stay in sync
 * between the two paths.
 */
function buildMismatchMessage(
	lastVarName: string | null,
	finalString: string,
	opts: { mentionDetails: boolean },
): string {
	const excerpt =
		finalString.length > 80
			? finalString.slice(0, 40) + "..." + finalString.slice(-40)
			: finalString;
	const varPart = lastVarName
		? `Could not match variable "${lastVarName}" - `
		: "Template does not match the rendered string - ";
	const suffix = opts.mentionDetails
		? ` (Access error.details for the full regex and input string.)`
		: "";
	return varPart + `unexpected content near "${excerpt}".` + suffix;
}

function buildMatchError(
	pattern: Pattern,
	regexStr: string,
	finalString: string,
): ReverseEjsError {
	const message = buildMismatchMessage(
		findLastVariableName(pattern),
		finalString,
		{ mentionDetails: true },
	);
	return new ReverseEjsError(message, {
		regex: regexStr,
		input: finalString,
	});
}

// ── Fast path: outer cursor walk ───────────────────────────────
//
// Walks the pattern's top-level sequence with a cursor over the rendered
// string — `startsWith` for each literal, `indexOf` for each capture's
// right boundary, `slice` for the captured region. No regex at all at
// the outer level.
//
// Loops and conditionals are kept as "opaque" segments: the walker
// determines their byte range via the NEXT literal anchor, then delegates
// to the regex-based `extract` on that small sub-string with the
// sub-pattern. The regex thus never sees the outer literal mass, so V8's
// ~40KB literal-in-regex cap doesn't apply.
//
// The fast path subsumes:
//   - Pure literals (zero captures, zero opaques)
//   - Literals + captures ("capture-only" templates)
//   - Literals + opaques + (optionally) captures, with a literal anchor
//     after each non-literal segment (no boundary ambiguity)
//
// Falls back to the regex path when:
//   - `flexibleWhitespace` is on (whitespace-collapsing isn't a cursor walk)
//   - A non-literal segment is followed by another non-literal (ambiguous
//     boundary — e.g. `<%= a %><%= b %>` after mergeAdjacent, or two
//     back-to-back loops)
//   - Any outer capture name collides with any name used inside an opaque
//     sub-pattern (preserves the regex's back-reference semantics, which
//     force matched slots to hold the same value)
//   - An outer capture key repeats (same back-reference reason)

type CaptureSegment = {
	type: "capture";
	key: string;
	raw: boolean;
	isExpression: boolean;
};
type LiteralSegment = { type: "literal"; value: string };
type OpaqueSegment = { type: "opaque"; pattern: Pattern };
type Segment = CaptureSegment | LiteralSegment | OpaqueSegment;

export interface FastPathPlan {
	segments: Segment[];
	// The last variable name encountered anywhere in the full pattern tree
	// (including inside opaque sub-patterns), used to reproduce the existing
	// "Could not match variable X" error shape on mismatch.
	lastVarName: string | null;
}

/**
 * Return a FastPathPlan when `pattern` qualifies for the outer-walk fast
 * path; otherwise null (caller falls back to the regex-based `extract`).
 *
 * See the block comment above this function for the rules that determine
 * qualification.
 */
export function buildFastPathPlan(pattern: Pattern): FastPathPlan | null {
	const segments: Segment[] = [];
	const outerKeys = new Set<string>();
	if (!collectFastPath(pattern, segments, outerKeys)) return null;

	// Each non-literal segment must be followed by a literal or be last.
	// This guarantees a concrete right boundary for every capture/opaque.
	for (let i = 0; i < segments.length; i++) {
		if (segments[i].type === "literal") continue;
		const next = segments[i + 1];
		if (next && next.type !== "literal") return null;
	}

	// For every opaque segment, verify its inner names don't collide with
	// any outer capture OR any other opaque's inner names. Outer/inner
	// collisions would mean the regex path used a back-reference (forcing
	// equal values across slots), which the walker can't reproduce.
	// Inner/inner collisions cover the "same array iterated twice" case
	// that the regex builder explicitly refuses with a friendly error —
	// falling back to regex lets that error surface as before.
	const allInner = new Set<string>();
	for (const seg of segments) {
		if (seg.type !== "opaque") continue;
		const inner = new Set<string>();
		collectInnerNames(seg.pattern, inner, []);
		for (const name of inner) {
			if (outerKeys.has(name)) return null;
			if (allInner.has(name)) return null;
			allInner.add(name);
		}
	}

	return { segments, lastVarName: findLastVariableName(pattern) };
}

function collectFastPath(
	p: Pattern,
	out: Segment[],
	outerKeys: Set<string>,
): boolean {
	if (p.type === "literal") {
		// Adjacent literals can collapse. `mergeAdjacent` in patternBuilder
		// only merges captures, not literals, so this is worth doing here
		// to keep the segment list tight.
		const last = out[out.length - 1];
		if (last && last.type === "literal") last.value += p.value;
		else out.push({ type: "literal", value: p.value });
		return true;
	}
	if (p.type === "variable") {
		if (outerKeys.has(p.name)) return false;
		outerKeys.add(p.name);
		out.push({
			type: "capture",
			key: p.name,
			raw: p.raw ?? false,
			isExpression: false,
		});
		return true;
	}
	if (p.type === "expression") {
		if (outerKeys.has(p.expression)) return false;
		outerKeys.add(p.expression);
		out.push({
			type: "capture",
			key: p.expression,
			raw: p.raw ?? false,
			isExpression: true,
		});
		return true;
	}
	if (p.type === "loop" || p.type === "conditional") {
		out.push({ type: "opaque", pattern: p });
		return true;
	}
	if (p.type === "sequence") {
		for (const part of p.parts) {
			if (!collectFastPath(part, out, outerKeys)) return false;
		}
		return true;
	}
	return false;
}

/**
 * Walk a pattern tree collecting every variable/expression/loop-array
 * name it references, as it would appear in the outer result object.
 * Applies loop itemName-stripping so inner references like `i.name`
 * (with itemName=i) register as `name` — matching the key the regex
 * path would use and catching back-reference collisions correctly.
 */
function collectInnerNames(
	p: Pattern,
	out: Set<string>,
	itemStack: string[],
): void {
	if (p.type === "variable") {
		out.add(stripAnyItemPrefix(p.name, itemStack));
	} else if (p.type === "expression") {
		let expr = p.expression;
		for (const item of itemStack) expr = stripItemPrefix(expr, item);
		out.add(expr);
	} else if (p.type === "loop") {
		out.add(stripAnyItemPrefix(p.arrayName, itemStack));
		collectInnerNames(p.body, out, [...itemStack, p.itemName]);
	} else if (p.type === "conditional") {
		collectInnerNames(p.thenBranch, out, itemStack);
		if (p.elseBranch) collectInnerNames(p.elseBranch, out, itemStack);
	} else if (p.type === "sequence") {
		for (const part of p.parts) collectInnerNames(part, out, itemStack);
	}
}

function stripAnyItemPrefix(name: string, items: string[]): string {
	for (const item of items) {
		if (name === item) return name; // bare item ref — leave alone
		if (name.startsWith(item + ".")) return name.slice(item.length + 1);
	}
	return name;
}

export function extractFastPath(
	plan: FastPathPlan,
	finalString: string,
	opts?: EjsOptions,
): ExtractedObject | null {
	const unescape = opts?.unescape ?? unescapeHtml;
	const segments = plan.segments;
	const result: ExtractedObject = {};
	let pos = 0;

	// Options passed to inner extract() calls. `types` is applied once at
	// the outer level after all merges, so inner calls skip it. `safe` is
	// forced true so inner mismatches surface as null and we can throw a
	// unified outer error instead of a regex-built one.
	const innerOpts: EjsOptions = {
		...opts,
		types: undefined,
		safe: true,
	};

	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (seg.type === "literal") {
			if (!finalString.startsWith(seg.value, pos)) {
				return fastPathMismatch(plan, finalString, opts);
			}
			pos += seg.value.length;
			continue;
		}

		// Non-literal. The right boundary is the NEXT literal's indexOf, or
		// rendered.length when there is no next (validated in plan builder
		// that next is literal or absent).
		const next = segments[i + 1];
		let end: number;
		if (!next) {
			end = finalString.length;
		} else {
			end = finalString.indexOf((next as LiteralSegment).value, pos);
			if (end === -1) return fastPathMismatch(plan, finalString, opts);
		}

		if (seg.type === "capture") {
			const raw = finalString.slice(pos, end);
			const value = seg.raw ? raw : unescape(raw);
			if (seg.isExpression) {
				result[seg.key] = value;
			} else {
				setNested(result, seg.key, value);
			}
			pos = end;
			continue;
		}

		// Opaque: delegate the sub-section to the regex-based extract so we
		// inherit loop iteration and conditional branching semantics without
		// duplicating them. The regex now only covers the inner pattern, so
		// V8's literal-in-regex cap is irrelevant no matter how big the
		// surrounding template is.
		const section = finalString.slice(pos, end);
		const subResult = extract(seg.pattern, section, innerOpts);
		if (subResult === null) {
			return fastPathMismatch(plan, finalString, opts);
		}
		deepMergeInto(result, subResult);
		pos = end;
	}

	if (pos !== finalString.length) {
		return fastPathMismatch(plan, finalString, opts);
	}

	if (opts?.types) {
		applyCoercions(
			result as Record<string, unknown>,
			opts.types,
			opts.silent,
		);
	}
	return result;
}

/**
 * Deep-merge `src` into `dst` for extracted objects. Necessary because an
 * outer capture and an opaque sub-result can both write under the same
 * top-level key (e.g. outer captures `sidebar.title` → {sidebar: {title}}
 * while the opaque loop captures `sidebar.links` → {sidebar: {links}} —
 * a shallow Object.assign would lose one side's nested data).
 *
 * Rules:
 *   - Both sides plain objects: recurse
 *   - Otherwise: src wins (consistent with last-write-wins elsewhere)
 */
function deepMergeInto(dst: ExtractedObject, src: ExtractedObject): void {
	for (const [k, v] of Object.entries(src)) {
		const existing = dst[k];
		if (isPlainObject(existing) && isPlainObject(v)) {
			deepMergeInto(
				existing as unknown as ExtractedObject,
				v as unknown as ExtractedObject,
			);
		} else {
			dst[k] = v as ExtractedObject[string];
		}
	}
}

function fastPathMismatch(
	plan: FastPathPlan,
	finalString: string,
	opts?: EjsOptions,
): null {
	if (opts?.safe) return null;
	// Reconstruct a regex-shaped string from segments for `details.regex`.
	// The fast path never compiled a real regex, but downstream tooling
	// (and existing tests) expect `details.regex` to describe the shape
	// that was being matched.
	const regexShape = segmentsToRegexShape(plan.segments);
	const message = buildMismatchMessage(plan.lastVarName, finalString, {
		mentionDetails: false,
	});
	throw new ReverseEjsError(message, {
		regex: regexShape,
		input: finalString,
	});
}

function segmentsToRegexShape(segments: Segment[]): string {
	let out = "^";
	for (const seg of segments) {
		if (seg.type === "literal") {
			out += escapeRegex(seg.value);
		} else if (seg.type === "capture") {
			out += `(?<${seg.key.replace(/\./g, "_")}>.*?)`;
		} else {
			// Opaque — placeholder; the real sub-regex lives inside `seg.pattern`
			// and isn't worth reconstructing just for a debug string.
			out += `(?:…)`;
		}
	}
	return out + "$";
}

export function extract(
	pattern: Pattern,
	finalString: string,
	opts?: EjsOptions,
): ExtractedObject | null {
	const unescape = opts?.unescape ?? unescapeHtml;
	const flexWs = opts?.flexibleWhitespace;
	const silent = opts?.silent;
	const safe = opts?.safe;

	const nameCtx = createNameContext();
	const regexStr = buildRegex(
		pattern,
		undefined,
		new Set(),
		undefined,
		undefined,
		flexWs,
		nameCtx,
	);

	// Pre-flight: check for duplicate named groups. If the library ever
	// emits two `(?<same_name>...)` captures that's a library bug, not a
	// V8 complexity issue — catching it here avoids blaming V8 for our
	// output. Duplicate loop names are the known cause (now prevented in
	// buildRegex) but this catches anything similar that might sneak in.
	assertNoDuplicateGroups(regexStr);

	// V8's regex compiler has shape-dependent size/complexity limits that
	// can't be computed from source length alone. It also lazy-compiles —
	// `new RegExp` succeeds and the SyntaxError surfaces at first `.exec()`.
	// Wrap both steps and convert any V8 regex error into a ReverseEjsError
	// with an actionable message instead of the cryptic built-in one (which
	// dumps the full regex into its message).
	let match: RegExpExecArray | null;
	try {
		const regex = new RegExp(`^${regexStr}$`, "s");
		match = regex.exec(finalString);
	} catch (err) {
		if (
			err instanceof SyntaxError &&
			err.message.startsWith("Invalid regular expression")
		) {
			throw new ReverseEjsError(
				`Template generates a ${regexStr.length}-byte regex that V8's ` +
					`regex engine refused to compile. The pattern is too complex ` +
					`(too many captures, alternations, or nested repetitions). ` +
					`Consider splitting the template into multiple extractions, ` +
					`or factoring repeated structure into a partial so it appears ` +
					`once in the regex instead of N times.`,
				{
					regex: regexStr.slice(0, 200) + " …[truncated]",
					input: "",
				},
			);
		}
		throw err;
	}

	if (!match) {
		if (safe) return null;
		throw buildMatchError(pattern, regexStr, finalString);
	}

	const exprMap = buildExprIdMap(pattern);
	const result: ExtractedObject = match.groups
		? groupsToObject(
				match.groups,
				pattern,
				exprMap,
				nameCtx,
				unescape,
				flexWs,
			)
		: {};

	if (opts?.types) {
		applyCoercions(result as Record<string, unknown>, opts.types, silent);
	}

	return result;
}

function groupsToObject(
	groups: Record<string, string | undefined>,
	pattern: Pattern,
	exprMap: Map<number, string>,
	nameCtx: NameContext,
	unescape: (s: string) => string,
	flexWs?: boolean,
): ExtractedObject {
	const result: ExtractedObject = {};

	for (const captureName of Object.keys(groups)) {
		const value = groups[captureName];
		if (value == null) continue;

		if (captureName.endsWith("_LOOP")) {
			const shortBase = captureName.slice(0, -5);
			const arrayName = resolveBase(shortBase, nameCtx);
			const loopPattern = findLoop(pattern, arrayName);
			if (loopPattern) {
				setNested(
					result,
					arrayName,
					extractLoopItems(
						loopPattern,
						value,
						exprMap,
						unescape,
						flexWs,
					),
				);
			}
		} else if (SENTINEL_RE.test(captureName)) {
			// sentinel - handled by extractConditionBooleans
		} else {
			const exprMatch = EXPR_RE.exec(captureName);
			if (exprMatch) {
				const exprText = exprMap.get(Number(exprMatch[1]));
				if (exprText) {
					const isRaw = RAW_RE.test(captureName);
					result[exprText] = isRaw ? value : unescape(value);
				}
				continue;
			}
			const isRaw = RAW_RE.test(captureName);
			const cleanName = captureName.replace(RAW_RE, "");
			const branchMatch = BRANCH_RE.exec(cleanName);
			const shortBase = branchMatch ? branchMatch[1] : cleanName;
			const dottedKey = resolveBase(shortBase, nameCtx);
			const val = isRaw ? value : unescape(value);
			setNested(result, dottedKey, val);
		}
	}

	extractConditionBooleans(groups, pattern, result);
	return result;
}

function extractLoopItems(
	loopPattern: LoopPattern,
	loopSection: string,
	exprMap: Map<number, string>,
	unescape: (s: string) => string,
	flexWs?: boolean,
): ExtractedItem[] {
	if (!loopSection) return [];

	// Loop body regex is independent of the outer regex — it gets its own
	// NameContext so short names don't collide across regex boundaries.
	const bodyNameCtx = createNameContext();
	const bodyRegexStr = buildRegex(
		loopPattern.body,
		loopPattern.itemName || undefined,
		new Set(),
		undefined,
		loopPattern.loopVar,
		flexWs,
		bodyNameCtx,
	);
	const bodyRegex = new RegExp(bodyRegexStr, "gs");

	const items: ExtractedItem[] = [];
	let match: RegExpExecArray | null;

	while ((match = bodyRegex.exec(loopSection)) !== null) {
		if (!match.groups) continue;

		const simpleGroups: Record<string, string> = {};
		const nestedLoops: Record<string, string> = {};
		const exprValues: Record<string, { value: string; raw: boolean }> = {};

		for (const rawKey of Object.keys(match.groups)) {
			const val = match.groups[rawKey];
			if (val == null) continue;
			if (SENTINEL_RE.test(rawKey.replace(RAW_RE, ""))) continue;

			const exprMatch = EXPR_RE.exec(rawKey);
			if (exprMatch) {
				const exprText = exprMap.get(Number(exprMatch[1]));
				if (exprText) {
					const stripped = stripItemPrefix(
						exprText,
						loopPattern.itemName,
					);
					exprValues[stripped] = {
						value: val,
						raw: RAW_RE.test(rawKey),
					};
				}
				continue;
			}

			const key = rawKey.replace(RAW_RE, "");
			if (key.endsWith("_LOOP")) {
				const shortBase = key.slice(0, -5);
				nestedLoops[resolveBase(shortBase, bodyNameCtx)] = val;
			} else {
				const branchMatch = BRANCH_RE.exec(key);
				const shortBase = branchMatch ? branchMatch[1] : key;
				simpleGroups[resolveBase(shortBase, bodyNameCtx)] = val;
			}
		}

		const allKeys = [
			...Object.keys(simpleGroups),
			...Object.keys(nestedLoops),
			...Object.keys(exprValues),
		];

		// No more `__` encoding — keys in simpleGroups / nestedLoops are
		// already the original dotted names.
		const expectedItemKey = loopPattern.itemName ?? null;
		const isSimple =
			allKeys.length === 1 &&
			Object.keys(simpleGroups).length === 1 &&
			(!expectedItemKey || allKeys[0] === expectedItemKey);

		if (isSimple) {
			items.push(unescape(simpleGroups[allKeys[0]]));
		} else {
			const item: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(simpleGroups)) {
				setNested(item, k, unescape(v));
			}
			for (const [arrayName, content] of Object.entries(nestedLoops)) {
				const nested =
					findLoop(loopPattern.body, arrayName) ??
					findLoop(
						loopPattern.body,
						`${loopPattern.itemName}.${arrayName}`,
					);
				if (nested)
					setNested(
						item,
						arrayName,
						extractLoopItems(
							nested,
							content,
							exprMap,
							unescape,
							flexWs,
						),
					);
			}
			for (const [exprKey, { value, raw }] of Object.entries(
				exprValues,
			)) {
				item[exprKey] = raw ? value : unescape(value);
			}
			items.push(item);
		}
	}

	return items;
}

/**
 * True if any capture with the given branch-suffix pattern is defined in
 * `groups`. Used when the regex builder skipped the sentinel for a branch
 * that had its own witness captures — we infer "branch matched" from the
 * witness being defined.
 */
function anyBranchCaptureDefined(
	groups: Record<string, string | undefined>,
	id: number,
	side: "T" | "E",
): boolean {
	// Witness captures end in `_C{id}T`, `_C{id}T_RAW`, `_C{id}E`, or
	// `_C{id}E_RAW`. Sentinels end in `_C{id}TS` / `_C{id}ES` — NOT witnesses.
	const marker = `_C${id}${side}`;
	for (const [name, value] of Object.entries(groups)) {
		if (value === undefined) continue;
		const idx = name.indexOf(marker);
		if (idx === -1) continue;
		const after = name.slice(idx + marker.length);
		if (after === "" || after === "_RAW") return true;
	}
	return false;
}

function extractConditionBooleans(
	groups: Record<string, string | undefined>,
	pattern: Pattern,
	result: ExtractedObject,
): void {
	if (pattern.type === "conditional") {
		if (pattern.condition) {
			const id = pattern.condId ?? 0;
			// The sentinel is emitted only when a branch has no other
			// captures to witness its match. Check the sentinel first; if
			// absent, fall back to witness-capture presence.
			const thenMatched =
				groups[`_C${id}TS`] !== undefined ||
				anyBranchCaptureDefined(groups, id, "T");
			const elseMatched =
				groups[`_C${id}ES`] !== undefined ||
				anyBranchCaptureDefined(groups, id, "E");
			// Don't overwrite nested object with a boolean
			const hasNestedData = isPlainObject(result[pattern.condition]);
			// Complex conditions (anything beyond a bare identifier) emit a
			// boolean even when the if-without-else branch did not match.
			const isComplex = !/^[a-zA-Z_$][\w$]*$/.test(pattern.condition);
			if (!hasNestedData) {
				if (thenMatched) result[pattern.condition] = true;
				else if (elseMatched) result[pattern.condition] = false;
				else if (isComplex) result[pattern.condition] = false;
			}
		}
		extractConditionBooleans(groups, pattern.thenBranch, result);
		if (pattern.elseBranch)
			extractConditionBooleans(groups, pattern.elseBranch, result);
	} else if (pattern.type === "sequence") {
		for (const part of pattern.parts)
			extractConditionBooleans(groups, part, result);
	}
	// Conditions inside loops are not handled here — their sentinels aren't
	// reachable from the outer match (loop bodies compile into
	// `(?:body)*` with no groups). Per-iteration condition extraction would
	// need to happen inside `extractLoopItems`; until then, conditions nested
	// inside a loop body are silently dropped from the output rather than
	// emitting a misleading top-level value from the last iteration.
}

function findLoop(pattern: Pattern, arrayName: string): LoopPattern | null {
	// Prefer an exact match — fall back to suffix match only if no exact
	// match exists anywhere in the tree. Without this split, a top-level
	// `items` lookup could be shadowed by a nested `outer.items` whose
	// `arrayName.endsWith(".items")` returns truthy, silently dropping
	// the top-level array's extracted data.
	const exact = findLoopBy(pattern, arrayName, "exact");
	if (exact) return exact;
	return findLoopBy(pattern, arrayName, "suffix");
}

function findLoopBy(
	pattern: Pattern,
	arrayName: string,
	mode: "exact" | "suffix",
): LoopPattern | null {
	if (pattern.type === "loop") {
		const isMatch =
			mode === "exact"
				? pattern.arrayName === arrayName
				: pattern.arrayName.endsWith(`.${arrayName}`);
		if (isMatch) return pattern;
		return findLoopBy(pattern.body, arrayName, mode);
	}
	if (pattern.type === "sequence") {
		for (const part of pattern.parts) {
			const found = findLoopBy(part, arrayName, mode);
			if (found) return found;
		}
	}
	if (pattern.type === "conditional") {
		const found = findLoopBy(pattern.thenBranch, arrayName, mode);
		if (found) return found;
		if (pattern.elseBranch)
			return findLoopBy(pattern.elseBranch, arrayName, mode);
	}
	return null;
}
