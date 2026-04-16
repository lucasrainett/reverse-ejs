export type Token =
	| { type: "literal"; value: string }
	| { type: "variable"; name: string; raw?: boolean }
	| { type: "expression"; expression: string; raw?: boolean }
	| {
			type: "loop_start";
			arrayName: string;
			itemName: string;
			loopVar?: string;
	  }
	| { type: "loop_end" }
	| { type: "if_start"; condition?: string }
	| { type: "else" }
	| { type: "if_end" };

export type Pattern =
	| { type: "sequence"; parts: Pattern[] }
	| { type: "literal"; value: string }
	| { type: "variable"; name: string; raw?: boolean }
	| { type: "expression"; expression: string; exprId?: number; raw?: boolean }
	| {
			type: "loop";
			arrayName: string;
			itemName: string;
			body: Pattern;
			loopVar?: string;
	  }
	| {
			type: "conditional";
			thenBranch: Pattern;
			elseBranch?: Pattern;
			condition?: string;
			condId?: number;
	  };

export type LoopPattern = Extract<Pattern, { type: "loop" }>;

/**
 * Type to coerce extracted string values into.
 *
 * - `"string"` (default) - keep as-is.
 * - `"number"` - convert via `Number(value)`. Warns if NaN.
 * - `"boolean"` - `"true"` to `true`, `"false"` to `false` (case-insensitive). Warns otherwise.
 * - `"date"` - convert via `new Date(value)`. Warns if invalid.
 */
export type CoercionType = "string" | "number" | "boolean" | "date";

/**
 * Custom date parser for values that `new Date(string)` can't handle
 * (non-ISO formats, locale-specific strings, epoch seconds as strings,
 * etc.). Return an invalid `Date` to trigger the standard coercion
 * warning / fallback to string.
 *
 * @example
 * types: {
 *   createdAt: {
 *     type: "date",
 *     parse: (s) => new Date(s + "Z"),   // force UTC on a naive string
 *   },
 * }
 */
export interface DateCoercion {
	type: "date";
	parse: (value: string) => Date;
}

/**
 * Either the string shorthand (`"number"`, `"date"`, ...) or a richer
 * spec object. Only `"date"` currently has a spec form; the others are
 * deterministic enough that a custom parser isn't useful.
 */
export type CoercionSpec = CoercionType | DateCoercion;

/**
 * Options for reversing an EJS template.
 *
 * All fields are optional. The library has sensible defaults for every option.
 */
export interface EjsOptions {
	/**
	 * Override the inner delimiter character. Default: `"%"`.
	 *
	 * @example
	 * reverseEjs("<?= name ?>", "Alice", { delimiter: "?" });
	 */
	delimiter?: string;

	/**
	 * Override the opening delimiter character. Default: `"<"`.
	 *
	 * @example
	 * reverseEjs("[%= name %]", "Alice", { openDelimiter: "[", closeDelimiter: "]" });
	 */
	openDelimiter?: string;

	/**
	 * Override the closing delimiter character. Default: `">"`.
	 */
	closeDelimiter?: string;

	/**
	 * Strip leading and trailing whitespace from every template line before
	 * matching. Mirrors EJS's own `rmWhitespace` option.
	 */
	rmWhitespace?: boolean;

	/**
	 * Ignore whitespace differences between the template and the rendered HTML.
	 * Treats every whitespace run as flexible (zero or more characters).
	 *
	 * Recommended for web data extraction where you don't control the source
	 * formatting (minified vs pretty-printed HTML).
	 *
	 * @example
	 * const template = `<div>
	 *   <h1><%= title %></h1>
	 * </div>`;
	 * reverseEjs(template, "<div><h1>Hello</h1></div>", { flexibleWhitespace: true });
	 */
	flexibleWhitespace?: boolean;

	/**
	 * Custom function to unescape HTML entities in extracted values. Defaults
	 * to a function that handles `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`.
	 *
	 * @example
	 * const unescape = (s) => s.replace(/&#(\d+);/g, (_, c) =>
	 *   String.fromCharCode(Number(c)));
	 * reverseEjs(template, html, { unescape });
	 */
	unescape?: (s: string) => string;

	/**
	 * Map of partial name to EJS source. Used to expand `<%- include("name") %>`
	 * tags before tokenizing. The library never reads from disk - all partials
	 * must be provided here.
	 *
	 * @example
	 * const partials = { header: "<h1><%= title %></h1>" };
	 * reverseEjs('<%- include("header") %>', "<h1>Hello</h1>", { partials });
	 */
	partials?: Record<string, string>;

	/**
	 * When `true`, return `null` instead of throwing on a match failure.
	 *
	 * Useful when processing untrusted or varied HTML where some inputs may
	 * not match the template structure.
	 *
	 * @example
	 * const result = reverseEjs(template, html, { safe: true });
	 * if (result === null) console.warn("HTML did not match template");
	 */
	safe?: boolean;

	/**
	 * Suppress `console.warn` output from failed type coercions.
	 */
	silent?: boolean;

	/**
	 * Coerce extracted string values to other types. Maps variable name to a
	 * coercion type. Coercion is applied to top-level values and inside loop
	 * items recursively.
	 *
	 * If coercion fails (e.g. `"thirty"` to number), the original string is
	 * kept and a warning is logged (suppressed by `silent: true`).
	 *
	 * @example
	 * reverseEjs(
	 *   "Age: <%= age %>, Active: <%= active %>",
	 *   "Age: 30, Active: true",
	 *   { types: { age: "number", active: "boolean" } }
	 * );
	 * // => { age: 30, active: true }
	 */
	types?: Record<string, CoercionSpec>;

	/**
	 * When `true`, `compileTemplate` and `reverseEjs` throw immediately
	 * if the template would produce any "raw-key fallback" key in the
	 * output — expression keys (`<%= title.toUpperCase() %>` → key
	 * `"title.toUpperCase()"`), adjacent-variable joined keys
	 * (`<%= a %><%= b %>` → `"a + b"`), and complex-condition booleans
	 * (`<% if (a > b) { %>...<% } %>` → `"a > b": true`).
	 *
	 * Use this when you want deterministic, structured extraction and
	 * would rather fail loudly at compile time than get surprising
	 * keys in your result object.
	 *
	 * @example
	 * reverseEjs("<%= title.toUpperCase() %>", "HELLO", { strict: true });
	 * // throws: strict mode: template contains raw-key fallbacks...
	 */
	strict?: boolean;
}

/**
 * A single item inside an extracted array. Either a primitive (for string
 * arrays) or an object (for arrays of records).
 */
export type ExtractedItem =
	| string
	| number
	| boolean
	| Date
	| Record<string, unknown>;

/**
 * A value in the extracted result object. Strings are the default; numbers,
 * booleans and Dates appear when type coercion is enabled. Arrays are produced
 * by loop extraction.
 */
export type ExtractedValue = string | number | boolean | Date | ExtractedItem[];

/**
 * The data object returned by `reverseEjs()`. Keys are variable names from the
 * template; values are the extracted strings (or coerced types).
 */
export type ExtractedObject = Record<string, ExtractedValue>;
