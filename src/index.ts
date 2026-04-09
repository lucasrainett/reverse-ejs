import { tokenize } from "./tokenizer";
import { buildPattern } from "./patternBuilder";
import { extract } from "./extractor";
import type { EjsOptions } from "./types";
import { ExtractedObject } from "./types";

export type ReverseEjsOptions = EjsOptions;
export { ExtractedObject };

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

export function reverseEjs(
	template: string,
	finalString: string,
	options?: ReverseEjsOptions,
): ExtractedObject {
	const expanded = options?.partials
		? expandIncludes(template, options.partials)
		: template;

	const tokens = tokenize(expanded, options);
	const pattern = buildPattern(tokens);
	return extract(pattern, finalString, options);
}
