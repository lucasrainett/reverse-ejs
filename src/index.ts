import { tokenize } from "./tokenizer";
import { buildPattern } from "./patternBuilder";
import { extract } from "./extractor";
import { buildRegex } from "./regexBuilder";
import type { EjsOptions, Pattern } from "./types";
import { ExtractedObject } from "./types";
import { ReverseEjsError } from "./errors";

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

export interface CompiledTemplate {
	match(finalString: string): ExtractedObject | null;
}

export function compileTemplate(
	template: string,
	options?: ReverseEjsOptions,
): CompiledTemplate {
	const expanded = options?.partials
		? expandIncludes(template, options.partials)
		: template;

	const tokens = tokenize(expanded, options);
	const pattern: Pattern = buildPattern(tokens);

	// Pre-validate the pattern by building the regex once.
	// This surfaces adjacent-variable errors at compile time, not match time.
	try {
		buildRegex(
			pattern,
			undefined,
			new Set(),
			undefined,
			undefined,
			options?.flexibleWhitespace,
			{ template: expanded },
		);
	} catch (e) {
		// Re-throw with template context attached.
		if (e instanceof ReverseEjsError) throw e;
		throw e;
	}

	return {
		match(finalString: string): ExtractedObject | null {
			return extract(pattern, finalString, options);
		},
	};
}

// Function overloads for proper type inference with `safe` option.
export function reverseEjs(
	template: string,
	finalString: string,
	options: ReverseEjsOptions & { safe: true },
): ExtractedObject | null;
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
