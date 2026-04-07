import type { Pattern } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toCaptureName(name: string): string {
	return name.replace(/\./g, "__");
}

export function fromCaptureName(name: string): string {
	return name.replace(/__/g, ".");
}

/** Named capture group names must be valid JS identifiers. */
function isValidCaptureName(name: string): boolean {
	return /^[a-zA-Z_$][\w$]*$/.test(name);
}

// ─── Main builder ─────────────────────────────────────────────────────────────

/**
 * Build a regex string for `pattern`.
 *
 * itemName     — when inside a loop body, restricts which variable names are
 *                captured.  Others become anonymous `[\s\S]+?` groups.
 * seen         — capture names already emitted; duplicate → backreference.
 * branchSuffix — `_C{id}T` / `_C{id}E` for conditional branches.
 * loopVar      — loop variable name for classic `for` loops; enables bracket
 *                access `arr[i]` to be treated as the loop item.
 */
export function buildRegex(
	pattern: Pattern,
	itemName?: string,
	seen: Set<string> = new Set(),
	branchSuffix?: string,
	loopVar?: string,
): string {
	switch (pattern.type) {
		case "literal":
			return escapeRegex(pattern.value);

		case "variable": {
			let captureName = pattern.name;

			// ── Inside a loop body ───────────────────────────────────────────────
			if (itemName !== undefined) {
				const bracketItem = loopVar ? `${itemName}[${loopVar}]` : "";

				if (captureName === itemName) {
					// direct item — keep name as-is
				} else if (itemName && captureName.startsWith(itemName + ".")) {
					// item.prop  →  prop
					captureName = captureName.slice(itemName.length + 1);
				} else if (bracketItem && captureName === bracketItem) {
					// arr[i]  →  treat as direct item
					captureName = itemName || captureName;
				} else if (!itemName) {
					// while loop (itemName='') — capture all variables normally
				} else {
					// unrelated variable (loop index, etc.) — anonymous
					return `[\\s\\S]+?`;
				}
			}

			const key = toCaptureName(captureName) + (branchSuffix ?? "");

			// Expressions with JS operators produce invalid capture names → anonymous
			if (!isValidCaptureName(key)) return `[\\s\\S]+?`;

			if (seen.has(key)) return `\\k<${key}>`;
			seen.add(key);
			return `(?<${key}>[\\s\\S]+?)`;
		}

		case "loop": {
			let arrayCaptureName = pattern.arrayName;
			if (itemName && arrayCaptureName.startsWith(itemName + ".")) {
				arrayCaptureName = arrayCaptureName.slice(itemName.length + 1);
			}
			const bodyNoGroups = buildRegexNoGroups(pattern.body);
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
			);
			const elseSeen = new Set<string>();
			const elseRegex = buildRegex(
				pattern.elseBranch,
				itemName,
				elseSeen,
				eSfx,
				loopVar,
			);
			for (const k of thenSeen) seen.add(k);
			for (const k of elseSeen) seen.add(k);
			seen.add(`_C${id}TS`);
			seen.add(`_C${id}ES`);
			return `(?:${tSen}${thenRegex}|${eSen}${elseRegex})`;
		}

		case "sequence": {
			// Detect adjacent variables — they are always ambiguous
			for (let i = 0; i < pattern.parts.length - 1; i++) {
				const curr = pattern.parts[i];
				const next = pattern.parts[i + 1];
				if (curr.type === "variable" && next.type === "variable") {
					throw new Error(
						"Adjacent variables with no literal separator are ambiguous",
					);
				}
			}
			return pattern.parts
				.map((p) =>
					buildRegex(p, itemName, seen, branchSuffix, loopVar),
				)
				.join("");
		}
	}
}

// ─── No-groups variant ────────────────────────────────────────────────────────

export function buildRegexNoGroups(pattern: Pattern): string {
	switch (pattern.type) {
		case "literal":
			return escapeRegex(pattern.value);
		case "variable":
			return `[\\s\\S]+?`;
		case "loop": {
			return `(?:${buildRegexNoGroups(pattern.body)})*`;
		}
		case "conditional": {
			const then = buildRegexNoGroups(pattern.thenBranch);
			if (!pattern.elseBranch) return `(?:${then})?`;
			return `(?:${then}|${buildRegexNoGroups(pattern.elseBranch)})`;
		}
		case "sequence":
			return pattern.parts.map(buildRegexNoGroups).join("");
	}
}
