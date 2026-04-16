import { tokenize } from "./tokenizer";
import { buildPattern } from "./patternBuilder";
import { extract, buildFastPathPlan, extractFastPath } from "./extractor";
import type {
	EjsOptions,
	Pattern,
	ExtractedValue,
	CoercionSpec,
} from "./types";
import { ExtractedObject } from "./types";
import { ReverseEjsError } from "./errors";

/**
 * Options accepted by `reverseEjs`, `compileTemplate`, and `reverseEjsAll`.
 *
 * See {@link EjsOptions} for the full field reference.
 */
export type ReverseEjsOptions = EjsOptions;

export { ExtractedObject, ReverseEjsError };
export type {
	CoercionType,
	CoercionSpec,
	DateCoercion,
	ExtractedValue,
} from "./types";

// ── Typed-result helpers ───────────────────────────────────────
//
// When the caller supplies a `types` map with a known shape, infer the
// concrete TypeScript type for each coerced key. Unknown keys fall back
// to the broad `ExtractedValue` union via the index signature, so
// callers can still access fields the `types` map didn't declare.

/** Concrete TS type for a given coercion spec (string shorthand or object form). */
type CoerceToType<T> = T extends "number"
	? number
	: T extends "boolean"
		? boolean
		: T extends "date"
			? Date
			: T extends { type: "date" }
				? Date
				: string;

/**
 * Extracted-object type narrowed by a `types` map. Known keys get the
 * precise coerced type; any other key is `ExtractedValue`.
 */
export type ExtractedResult<
	T extends Record<string, CoercionSpec> | undefined = undefined,
> =
	T extends Record<string, CoercionSpec>
		? { [K in keyof T]: CoerceToType<T[K]> } & {
				[key: string]: ExtractedValue;
			}
		: ExtractedObject;

// ── Compile-time checks ───────────────────────────────────────

const BARE_IDENT_RE = /^[a-zA-Z_$][\w$]*$/;

/**
 * Throw when the pattern would produce any "raw-key fallback" output —
 * expression keys, complex-condition booleans, adjacent-variable joined
 * keys (which appear as expressions after mergeAdjacent). Used by
 * `strict: true` so callers who want structured-only output fail
 * loudly at compile time instead of getting surprising keys at runtime.
 */
function assertStrict(pattern: Pattern): void {
	const fallbacks: string[] = [];
	function walk(p: Pattern): void {
		if (p.type === "expression") {
			fallbacks.push(`expression "${p.expression}"`);
		} else if (p.type === "sequence") {
			for (const part of p.parts) walk(part);
		} else if (p.type === "loop") {
			walk(p.body);
		} else if (p.type === "conditional") {
			if (p.condition && !BARE_IDENT_RE.test(p.condition)) {
				fallbacks.push(`complex condition "${p.condition}"`);
			}
			walk(p.thenBranch);
			if (p.elseBranch) walk(p.elseBranch);
		}
	}
	walk(pattern);
	if (fallbacks.length > 0) {
		throw new ReverseEjsError(
			`strict mode: template contains raw-key fallbacks that won't produce ` +
				`structured output: ${fallbacks.join(", ")}. Remove them from the ` +
				`template or run without \`strict: true\`.`,
			{ regex: "", input: "" },
		);
	}
}

/**
 * Warn once at compile time if the template has any conditional nested
 * inside a loop body. Those conditions are silently dropped from the
 * extracted per-iteration object today (a known library gap), so the
 * warning helps users discover why a `<% if (...) { %>` inside a
 * `forEach` doesn't surface in the output. Gated by `silent: true`.
 */
function warnConditionsInsideLoops(pattern: Pattern): void {
	const drops: string[] = [];
	function walk(p: Pattern, insideLoop: boolean): void {
		if (p.type === "conditional") {
			if (insideLoop && p.condition) drops.push(p.condition);
			walk(p.thenBranch, insideLoop);
			if (p.elseBranch) walk(p.elseBranch, insideLoop);
		} else if (p.type === "sequence") {
			for (const part of p.parts) walk(part, insideLoop);
		} else if (p.type === "loop") {
			walk(p.body, true);
		}
	}
	walk(pattern, false);
	if (drops.length > 0) {
		console.warn(
			`[reverse-ejs] Conditions inside loop bodies are not captured ` +
				`per iteration (known gap): ${drops.join(", ")}. Set ` +
				`silent: true to suppress this warning.`,
		);
	}
}

const INCLUDE_RE =
	/<%-\s*include\s*\(\s*['"]([^'"]+)['"]\s*(?:,[^)]+)?\s*\)\s*%>/g;

function expandIncludes(
	template: string,
	partials: Record<string, string>,
	depth = 0,
): string {
	if (depth > 20)
		throw new Error(
			"Include depth limit exceeded - possible circular include",
		);
	return template.replace(INCLUDE_RE, (_match, name: string) => {
		const partial = partials[name];
		if (partial === undefined)
			throw new Error(`Partial "${name}" not found`);
		return expandIncludes(partial, partials, depth + 1);
	});
}

// ── Internal pattern cache ──────────────────────────────────────
//
// Compilation (tokenize + buildPattern) is ~42% of each fresh
// `reverseEjs()` call on a typical page. Users who call `reverseEjs()` in
// a loop without reaching for `compileTemplate` pay that cost every time.
// An LRU of recent patterns gives them the speedup automatically.
//
// The key covers ONLY compilation-affecting options. Extraction-time
// options (safe, silent, types, unescape) are applied per call via the
// closure in the returned `match()`, so they don't participate in the
// key. This keeps the hit rate high across calls that vary e.g. `safe`.

const MAX_PATTERN_CACHE = 32;
const patternCache = new Map<string, Pattern>();

function getCachedPattern(
	template: string,
	options?: ReverseEjsOptions,
): Pattern {
	const key = JSON.stringify([
		template,
		options?.delimiter,
		options?.openDelimiter,
		options?.closeDelimiter,
		options?.rmWhitespace,
		options?.flexibleWhitespace,
		options?.partials,
	]);
	const cached = patternCache.get(key);
	if (cached) {
		// Refresh LRU order on hit.
		patternCache.delete(key);
		patternCache.set(key, cached);
		return cached;
	}

	const expanded = options?.partials
		? expandIncludes(template, options.partials)
		: template;
	const tokens = tokenize(expanded, options);
	const pattern = buildPattern(tokens);

	if (patternCache.size >= MAX_PATTERN_CACHE) {
		const oldest = patternCache.keys().next().value;
		if (oldest !== undefined) patternCache.delete(oldest);
	}
	patternCache.set(key, pattern);
	return pattern;
}

/**
 * A pre-compiled EJS template ready for matching against rendered strings.
 *
 * Created by `compileTemplate()`. Reusing a compiled template avoids the cost
 * of re-tokenizing and re-building the regex on every call.
 *
 * The generic parameter `T` carries the shape of the `types` map passed to
 * `compileTemplate()`, so `match()` returns an object with those keys
 * narrowed to the coerced types (`number`, `boolean`, `Date`, `string`).
 */
export interface CompiledTemplate<
	T extends Record<string, CoercionSpec> | undefined = undefined,
> {
	/**
	 * Match a rendered string against the compiled template and return the
	 * extracted data.
	 *
	 * @param finalString - The rendered HTML or text to extract data from.
	 * @returns The extracted data object, or `null` if `safe: true` was passed
	 *          to `compileTemplate()` and the string did not match.
	 * @throws {ReverseEjsError} If the string does not match the template and
	 *         `safe` was not enabled.
	 */
	match(finalString: string): ExtractedResult<T> | null;
}

/**
 * Compile an EJS template into a reusable matcher.
 *
 * Use this when you need to extract data from many rendered strings against
 * the same template. The tokenizer, pattern builder, and regex are computed
 * once at compile time, then reused on every `match()` call.
 *
 * @param template - The EJS template source.
 * @param options - Optional configuration. See {@link ReverseEjsOptions}.
 * @returns A {@link CompiledTemplate} with a `match()` method.
 *
 * @example
 * import { compileTemplate } from "reverse-ejs";
 *
 * const compiled = compileTemplate("<%= name %> is <%= age %> years old.");
 * compiled.match("Alice is 30 years old."); // { name: "Alice", age: "30" }
 * compiled.match("Bob is 25 years old.");   // { name: "Bob", age: "25" }
 */
export function compileTemplate<T extends Record<string, CoercionSpec>>(
	template: string,
	options: ReverseEjsOptions & { types: T },
): CompiledTemplate<T>;
export function compileTemplate(
	template: string,
	options?: ReverseEjsOptions,
): CompiledTemplate;
export function compileTemplate(
	template: string,
	options?: ReverseEjsOptions,
): CompiledTemplate {
	const pattern = getCachedPattern(template, options);

	// Strict mode: reject templates that would produce raw-key fallback
	// output (expression keys, joined adjacent-variable keys, complex-
	// condition booleans). Throw eagerly at compile time so the caller
	// sees the mismatch between template shape and their stricter
	// expectations before any match() call.
	if (options?.strict) assertStrict(pattern);

	// Warn at compile time if the template has conditions inside loop
	// bodies — those conditions are silently dropped from per-iteration
	// output today (documented gap). Gated by `silent: true` so users
	// who've accepted the limitation don't get spammed.
	if (!options?.silent) warnConditionsInsideLoops(pattern);

	// Fast path: walk the outer pattern with a cursor, delegate loop and
	// conditional sub-sections to the regex-based extract on just their
	// sliced byte range. The regex never sees the outer literal mass, so
	// V8's ~40KB literal-in-regex cap doesn't apply. Subsumes pure-literal
	// and capture-only shapes. See `buildFastPathPlan` for the rules that
	// determine qualification. flexibleWhitespace stays on the regex path
	// because its whitespace-collapsing semantics don't map cleanly to a
	// cursor walk.
	//
	// The walker uses indexOf which takes the FIRST occurrence of the next
	// literal. Regex with non-greedy captures + anchored end may need to
	// BACKTRACK to a later occurrence so the rest of the pattern fits —
	// e.g. `<%= x %>a<%= y %>b` against "abaab" requires y="baa" for the
	// trailing "b" to match at position 4. The walker can't see past its
	// next-literal window, so when it returns null we try the regex path
	// as a fallback. The regex preserves exact semantics in those edge
	// cases; the fast path still handles the common shapes cheaply.
	if (!options?.flexibleWhitespace) {
		const plan = buildFastPathPlan(pattern);
		if (plan) {
			return {
				match(finalString: string): ExtractedObject | null {
					const fast = extractFastPath(plan, finalString, {
						...options,
						safe: true,
					});
					if (fast !== null) return fast;
					return extract(pattern, finalString, options);
				},
			};
		}
	}

	return {
		match(finalString: string): ExtractedObject | null {
			return extract(pattern, finalString, options);
		},
	};
}

/**
 * Reverse-extract a data object from a rendered EJS template.
 *
 * Given the original template and the rendered output, returns the data
 * object that would produce that output if passed to `ejs.render()`.
 *
 * @param template - The EJS template source.
 * @param finalString - The rendered HTML or text.
 * @param options - Set `safe: true` to return `null` instead of throwing on
 *                  match failure. See {@link ReverseEjsOptions}.
 * @returns `null` (only when `safe: true` and no match).
 * @throws {ReverseEjsError} If the rendered string does not match the
 *         template and `safe` is not enabled.
 *
 * @example
 * import { reverseEjs } from "reverse-ejs";
 *
 * reverseEjs("Hello, <%= name %>!", "Hello, Alice!");
 * // => { name: "Alice" }
 *
 * @example
 * // Loops produce arrays
 * reverseEjs(
 *   "<% items.forEach(item => { %><li><%= item %></li><% }) %>",
 *   "<li>Apple</li><li>Banana</li>"
 * );
 * // => { items: ["Apple", "Banana"] }
 *
 * @example
 * // Type coercion
 * reverseEjs("Age: <%= age %>", "Age: 30", { types: { age: "number" } });
 * // => { age: 30 }
 *
 * @example
 * // Safe mode
 * const result = reverseEjs(template, html, { safe: true });
 * if (result === null) console.warn("did not match");
 */
// Four ordered overloads so TS picks the right return type based on
// whether a `types` map AND/OR `safe: true` were passed. Overloads are
// tried top-to-bottom; the most specific (types + safe) comes first.
export function reverseEjs<T extends Record<string, CoercionSpec>>(
	template: string,
	finalString: string,
	options: ReverseEjsOptions & { safe: true; types: T },
): ExtractedResult<T> | null;
export function reverseEjs<T extends Record<string, CoercionSpec>>(
	template: string,
	finalString: string,
	options: ReverseEjsOptions & { types: T },
): ExtractedResult<T>;
export function reverseEjs(
	template: string,
	finalString: string,
	options: ReverseEjsOptions & { safe: true },
): ExtractedObject | null;
/**
 * Reverse-extract a data object from a rendered EJS template.
 *
 * @param template - The EJS template source.
 * @param finalString - The rendered HTML or text.
 * @param options - Optional configuration. See {@link ReverseEjsOptions}.
 * @returns The extracted data object.
 * @throws {ReverseEjsError} If the rendered string does not match the template.
 */
export function reverseEjs(
	template: string,
	finalString: string,
	options?: ReverseEjsOptions,
): ExtractedObject;
export function reverseEjs(
	template: string,
	finalString: string,
	options?: ReverseEjsOptions,
): ExtractedObject | null {
	const compiled = compileTemplate(template, options);
	return compiled.match(finalString);
}

/**
 * Reverse-extract data from many rendered strings against the same template.
 *
 * Compiles the template once, then matches every input in order. More
 * efficient than calling `reverseEjs()` in a loop.
 *
 * If `safe: true` is set in options, individual match failures produce `null`
 * entries in the result array. Otherwise, the first failure throws and stops
 * processing.
 *
 * @param template - The EJS template source.
 * @param finalStrings - Array of rendered strings to extract data from.
 * @param options - Optional configuration. See {@link ReverseEjsOptions}.
 * @returns Array of extracted data objects (or `null` entries when `safe`).
 * @throws {ReverseEjsError} If a string fails to match and `safe` is not set.
 *
 * @example
 * import { reverseEjsAll } from "reverse-ejs";
 *
 * const rows = reverseEjsAll(
 *   "<tr><td><%= name %></td><td><%= score %></td></tr>",
 *   [
 *     "<tr><td>Alice</td><td>95</td></tr>",
 *     "<tr><td>Bob</td><td>87</td></tr>",
 *   ],
 *   { types: { score: "number" } }
 * );
 * // => [{ name: "Alice", score: 95 }, { name: "Bob", score: 87 }]
 */
export function reverseEjsAll<T extends Record<string, CoercionSpec>>(
	template: string,
	finalStrings: string[],
	options: ReverseEjsOptions & { types: T },
): Array<ExtractedResult<T> | null>;
export function reverseEjsAll(
	template: string,
	finalStrings: string[],
	options?: ReverseEjsOptions,
): Array<ExtractedObject | null>;
export function reverseEjsAll(
	template: string,
	finalStrings: string[],
	options?: ReverseEjsOptions,
): Array<ExtractedObject | null> {
	const compiled = compileTemplate(template, options);
	const results: Array<ExtractedObject | null> = [];
	for (const str of finalStrings) {
		results.push(compiled.match(str));
	}
	return results;
}
