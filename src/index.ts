import { tokenize } from "./tokenizer";
import { buildPattern } from "./patternBuilder";
import { extract } from "./extractor";
import type { EjsOptions, Pattern } from "./types";
import { ExtractedObject } from "./types";
import { ReverseEjsError } from "./errors";

/**
 * Options accepted by `reverseEjs`, `compileTemplate`, and `reverseEjsAll`.
 *
 * See {@link EjsOptions} for the full field reference.
 */
export type ReverseEjsOptions = EjsOptions;

export { ExtractedObject, ReverseEjsError };
export type { CoercionType } from "./types";

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

/**
 * A pre-compiled EJS template ready for matching against rendered strings.
 *
 * Created by `compileTemplate()`. Reusing a compiled template avoids the cost
 * of re-tokenizing and re-building the regex on every call.
 */
export interface CompiledTemplate {
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
	match(finalString: string): ExtractedObject | null;
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
export function compileTemplate(
	template: string,
	options?: ReverseEjsOptions,
): CompiledTemplate {
	const expanded = options?.partials
		? expandIncludes(template, options.partials)
		: template;

	const tokens = tokenize(expanded, options);
	const pattern: Pattern = buildPattern(tokens);

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
