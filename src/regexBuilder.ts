import type { Pattern } from "./types";
import { ReverseEjsError } from "./errors";

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

		case "expression_skipped":
			return `[\\s\\S]+?`;

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
			for (let i = 0; i < pattern.parts.length - 1; i++) {
				const curr = pattern.parts[i];
				const next = pattern.parts[i + 1];
				if (curr.type === "variable" && next.type === "variable") {
					throwAdjacentVariablesError(curr.name, next.name, ctx);
				}
			}
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

function throwAdjacentVariablesError(
	firstName: string,
	secondName: string,
	ctx?: BuildContext,
): never {
	const tag1 = `<%= ${firstName} %>`;
	const tag2 = `<%= ${secondName} %>`;
	let position = "";
	if (ctx?.template) {
		// Find any tag mentioning the first variable name
		const re = new RegExp(
			`<%[=-]\\s*${firstName.replace(/\./g, "\\.")}\\s*%>`,
		);
		const match = re.exec(ctx.template);
		if (match) {
			position = ` at template position ${match.index}`;
		}
	}
	throw new ReverseEjsError(
		`Adjacent variables "${tag1}" and "${tag2}"${position} have no literal separator - extraction is ambiguous. Add static text between them.`,
		{ regex: "", input: "" },
	);
}

export function buildRegexNoGroups(pattern: Pattern, flexWs?: boolean): string {
	const esc = flexWs ? escapeRegexFlexWs : escapeRegex;

	switch (pattern.type) {
		case "literal":
			return esc(pattern.value);
		case "variable":
			return `[\\s\\S]*?`;
		case "expression_skipped":
			return `[\\s\\S]+?`;
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

export function collectExpressions(pattern: Pattern, out: string[]): void {
	if (pattern.type === "expression_skipped") {
		out.push(pattern.expression);
	} else if (pattern.type === "sequence") {
		for (const p of pattern.parts) collectExpressions(p, out);
	} else if (pattern.type === "loop") {
		collectExpressions(pattern.body, out);
	} else if (pattern.type === "conditional") {
		collectExpressions(pattern.thenBranch, out);
		if (pattern.elseBranch) collectExpressions(pattern.elseBranch, out);
	}
}

// Walks the pattern tree to find the last named variable that should have been
// captured but wasn't. Used for error messages on match failure.
export function findLastVariableBefore(
	pattern: Pattern,
	failureRegexStr: string,
): string | null {
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
	void failureRegexStr;
	return names[names.length - 1] ?? null;
}
