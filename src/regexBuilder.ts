import type { Pattern } from "./types";

export function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeRegexFlexWs(str: string): string {
	const escaped = escapeRegex(str);
	if (/^\s+$/.test(str)) return "\\s*";
	return escaped
		.replace(/\s+/g, "\\s*")
		.replace(/(>)(?!\\s\*)/g, "$1\\s*")
		.replace(/(?<!\\s\*)(<)/g, "\\s*$1");
}

function stripWsLiterals(pattern: Pattern): Pattern {
	if (pattern.type !== "sequence") return pattern;
	const parts = pattern.parts.filter(
		(p) => !(p.type === "literal" && /^\s+$/.test(p.value)),
	);
	if (parts.length === 0) return { type: "literal", value: "" };
	if (parts.length === 1) return parts[0];
	return { type: "sequence", parts };
}

export function toCaptureName(name: string): string {
	return name.replace(/\./g, "__");
}

export function fromCaptureName(name: string): string {
	return name.replace(/__/g, ".");
}

function isValidCaptureName(name: string): boolean {
	return /^[a-zA-Z_$][\w$]*$/.test(name);
}

export interface BuildContext {
	template?: string;
}

export function buildRegex(
	pattern: Pattern,
	itemName?: string,
	seen: Set<string> = new Set(),
	branchSuffix?: string,
	loopVar?: string,
	flexWs?: boolean,
	ctx?: BuildContext,
): string {
	const esc = flexWs ? escapeRegexFlexWs : escapeRegex;

	switch (pattern.type) {
		case "literal":
			return esc(pattern.value);

		case "expression": {
			const id = pattern.exprId ?? 0;
			const rawSuffix = pattern.raw ? "_RAW" : "";
			const key = `_E${id}` + (branchSuffix ?? "") + rawSuffix;
			if (seen.has(key)) return `\\k<${key}>`;
			seen.add(key);
			return `(?<${key}>[\\s\\S]*?)`;
		}

		case "variable": {
			let captureName = pattern.name;

			if (itemName !== undefined) {
				const bracketItem = loopVar ? `${itemName}[${loopVar}]` : "";

				if (captureName === itemName) {
					// direct item
				} else if (itemName && captureName.startsWith(itemName + ".")) {
					captureName = captureName.slice(itemName.length + 1);
				} else if (bracketItem && captureName === bracketItem) {
					captureName = itemName || captureName;
				} else if (!itemName) {
					// while loop - capture all variables
				} else {
					return `[\\s\\S]+?`;
				}
			}

			const rawSuffix = pattern.raw ? "_RAW" : "";
			const key =
				toCaptureName(captureName) + (branchSuffix ?? "") + rawSuffix;

			if (!isValidCaptureName(key)) return `[\\s\\S]+?`;
			if (seen.has(key)) return `\\k<${key}>`;
			seen.add(key);
			return `(?<${key}>[\\s\\S]*?)`;
		}

		case "loop": {
			let arrayCaptureName = pattern.arrayName;
			if (itemName && arrayCaptureName.startsWith(itemName + ".")) {
				arrayCaptureName = arrayCaptureName.slice(itemName.length + 1);
			}
			const body = flexWs ? stripWsLiterals(pattern.body) : pattern.body;
			const bodyNoGroups = buildRegexNoGroups(body, flexWs);
			return `(?<${toCaptureName(arrayCaptureName)}_LOOP>(?:${bodyNoGroups})*)`;
		}

		case "conditional": {
			const id = pattern.condId ?? 0;
			const tSfx = `_C${id}T`;
			const eSfx = `_C${id}E`;
			const tSen = `(?<_C${id}TS>)`;
			const eSen = `(?<_C${id}ES>)`;

			if (!pattern.elseBranch) {
				const thenSeen = new Set<string>();
				const thenRegex = buildRegex(
					pattern.thenBranch,
					itemName,
					thenSeen,
					tSfx,
					loopVar,
					flexWs,
					ctx,
				);
				for (const k of thenSeen) seen.add(k);
				seen.add(`_C${id}TS`);
				return `(?:${tSen}${thenRegex})?`;
			}

			const thenSeen = new Set<string>();
			const thenRegex = buildRegex(
				pattern.thenBranch,
				itemName,
				thenSeen,
				tSfx,
				loopVar,
				flexWs,
				ctx,
			);
			const elseSeen = new Set<string>();
			const elseRegex = buildRegex(
				pattern.elseBranch,
				itemName,
				elseSeen,
				eSfx,
				loopVar,
				flexWs,
				ctx,
			);
			for (const k of thenSeen) seen.add(k);
			for (const k of elseSeen) seen.add(k);
			seen.add(`_C${id}TS`);
			seen.add(`_C${id}ES`);
			return `(?:${tSen}${thenRegex}|${eSen}${elseRegex})`;
		}

		case "sequence": {
			return pattern.parts
				.map((p) =>
					buildRegex(
						p,
						itemName,
						seen,
						branchSuffix,
						loopVar,
						flexWs,
						ctx,
					),
				)
				.join("");
		}
	}
}

export function buildRegexNoGroups(pattern: Pattern, flexWs?: boolean): string {
	const esc = flexWs ? escapeRegexFlexWs : escapeRegex;

	switch (pattern.type) {
		case "literal":
			return esc(pattern.value);
		case "variable":
			return `[\\s\\S]*?`;
		case "expression":
			return `[\\s\\S]*?`;
		case "loop":
			return `(?:${buildRegexNoGroups(pattern.body, flexWs)})*`;
		case "conditional": {
			const then = buildRegexNoGroups(pattern.thenBranch, flexWs);
			if (!pattern.elseBranch) return `(?:${then})?`;
			return `(?:${then}|${buildRegexNoGroups(pattern.elseBranch, flexWs)})`;
		}
		case "sequence":
			return pattern.parts
				.map((p) => buildRegexNoGroups(p, flexWs))
				.join("");
	}
}

/**
 * Build a Map from exprId to the original expression text. Used by the
 * extractor to recover the human-readable key for an expression capture.
 */
export function buildExprIdMap(
	pattern: Pattern,
	map: Map<number, string> = new Map(),
): Map<number, string> {
	if (pattern.type === "expression" && pattern.exprId !== undefined) {
		map.set(pattern.exprId, pattern.expression);
	} else if (pattern.type === "sequence") {
		for (const p of pattern.parts) buildExprIdMap(p, map);
	} else if (pattern.type === "loop") {
		buildExprIdMap(pattern.body, map);
	} else if (pattern.type === "conditional") {
		buildExprIdMap(pattern.thenBranch, map);
		if (pattern.elseBranch) buildExprIdMap(pattern.elseBranch, map);
	}
	return map;
}
