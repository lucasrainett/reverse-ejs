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

/**
 * Tracks the mapping between the short capture names emitted into the regex
 * source (`c0`, `c1`, ...) and the semantic names the extractor needs
 * (`user__name`, `items`, etc.). Shrinking per-capture bytes is what pushes
 * V8's regex-size cap from ~4000 captures to ~15000+.
 *
 * Each regex has its own context. Loop-body regexes built inside
 * `extractLoopItems` use a fresh context isolated from the outer regex.
 */
export interface NameContext {
	shortToOriginal: Map<string, string>;
	nextIndex: number;
}

export function createNameContext(): NameContext {
	return { shortToOriginal: new Map(), nextIndex: 0 };
}

/** Resolve or assign the short base name for an original full name. */
function internName(ctx: NameContext, original: string): string {
	// Reverse lookup: if this original is already interned, reuse.
	for (const [short, orig] of ctx.shortToOriginal) {
		if (orig === original) return short;
	}
	const short = `c${ctx.nextIndex++}`;
	ctx.shortToOriginal.set(short, original);
	return short;
}

/**
 * True when the seen set contains at least one capture that DIRECTLY
 * belongs to this branch (i.e. has the matching `_C{id}{T|E}` suffix).
 * Used by conditional sentinel elimination.
 *
 * Why "direct": `branchSuffix` overwrites on recursive calls, so a nested
 * conditional inside a then-branch emits captures like `c0_C1T` — those
 * DON'T witness the outer branch's match. Only captures whose suffix
 * equals the outer branch's marker count as witnesses.
 */
function hasWitnessForSuffix(seen: Set<string>, suffix: string): boolean {
	for (const name of seen) {
		if (name.endsWith(suffix)) return true;
		if (name.endsWith(suffix + "_RAW")) return true;
	}
	return false;
}

export function buildRegex(
	pattern: Pattern,
	itemName?: string,
	seen: Set<string> = new Set(),
	branchSuffix?: string,
	loopVar?: string,
	flexWs?: boolean,
	nameCtx: NameContext = createNameContext(),
): string {
	const esc = flexWs ? escapeRegexFlexWs : escapeRegex;

	switch (pattern.type) {
		case "literal":
			return esc(pattern.value);

		case "expression": {
			// Expression ids are already numeric and globally unique; they
			// don't need the name-shortening treatment. Keep `_E${id}` as
			// the base so the extractor's EXPR_RE still parses it.
			const id = pattern.exprId ?? 0;
			const rawSuffix = pattern.raw ? "_RAW" : "";
			const key = `_E${id}` + (branchSuffix ?? "") + rawSuffix;
			if (seen.has(key)) return `\\k<${key}>`;
			seen.add(key);
			return `(?<${key}>.*?)`;
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
					return `.+?`;
				}
			}

			const rawSuffix = pattern.raw ? "_RAW" : "";
			const originalBase = toCaptureName(captureName);

			// Original-name validity check (e.g. bracket-access like
			// `items[0]` isn't a valid JS identifier). Preserve the old
			// behavior of falling back to non-capturing for these cases.
			const originalFull =
				originalBase + (branchSuffix ?? "") + rawSuffix;
			if (!isValidCaptureName(originalFull)) return `.+?`;

			const shortBase = internName(nameCtx, originalBase);
			const key = shortBase + (branchSuffix ?? "") + rawSuffix;

			if (seen.has(key)) return `\\k<${key}>`;
			seen.add(key);
			return `(?<${key}>.*?)`;
		}

		case "loop": {
			let arrayCaptureName = pattern.arrayName;
			if (itemName && arrayCaptureName.startsWith(itemName + ".")) {
				arrayCaptureName = arrayCaptureName.slice(itemName.length + 1);
			}
			const originalBase = toCaptureName(arrayCaptureName);
			const shortBase = internName(nameCtx, originalBase);
			const body = flexWs ? stripWsLiterals(pattern.body) : pattern.body;
			const bodyNoGroups = buildRegexNoGroups(body, flexWs);
			return `(?<${shortBase}_LOOP>(?:${bodyNoGroups})*)`;
		}

		case "conditional": {
			const id = pattern.condId ?? 0;
			const tSfx = `_C${id}T`;
			const eSfx = `_C${id}E`;
			const tSen = `(?<_C${id}TS>)`;
			const eSen = `(?<_C${id}ES>)`;

			// Build branch regexes first so we know whether each has any
			// non-sentinel captures — those act as branch-match witnesses,
			// letting us drop the sentinel.
			const thenSeen = new Set<string>();
			const thenRegex = buildRegex(
				pattern.thenBranch,
				itemName,
				thenSeen,
				tSfx,
				loopVar,
				flexWs,
				nameCtx,
			);
			const thenWitness = hasWitnessForSuffix(thenSeen, tSfx);
			for (const k of thenSeen) seen.add(k);

			if (!pattern.elseBranch) {
				const thenPart = thenWitness
					? thenRegex
					: `${tSen}${thenRegex}`;
				if (!thenWitness) seen.add(`_C${id}TS`);
				return `(?:${thenPart})?`;
			}

			const elseSeen = new Set<string>();
			const elseRegex = buildRegex(
				pattern.elseBranch,
				itemName,
				elseSeen,
				eSfx,
				loopVar,
				flexWs,
				nameCtx,
			);
			const elseWitness = hasWitnessForSuffix(elseSeen, eSfx);
			for (const k of elseSeen) seen.add(k);

			const thenPart = thenWitness ? thenRegex : `${tSen}${thenRegex}`;
			const elsePart = elseWitness ? elseRegex : `${eSen}${elseRegex}`;
			if (!thenWitness) seen.add(`_C${id}TS`);
			if (!elseWitness) seen.add(`_C${id}ES`);

			return `(?:${thenPart}|${elsePart})`;
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
						nameCtx,
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
			return `.*?`;
		case "expression":
			return `.*?`;
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
