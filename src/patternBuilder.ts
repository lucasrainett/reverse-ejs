import type { Token, Pattern } from "./types";

type StopReason = "loop_end" | "if_end" | "else" | "end";

export function buildPattern(tokens: Token[]): Pattern {
	const [pattern] = parseSequence(tokens, 0);
	assignCondIds({ n: 0 }, pattern);
	return pattern;
}

/** Depth-first assignment of sequential IDs to every conditional node. */
function assignCondIds(ctx: { n: number }, p: Pattern): void {
	if (p.type === "conditional") {
		(p as { condId: number }).condId = ctx.n++;
		assignCondIds(ctx, p.thenBranch);
		if (p.elseBranch) assignCondIds(ctx, p.elseBranch);
	} else if (p.type === "sequence") {
		p.parts.forEach((c) => assignCondIds(ctx, c));
	} else if (p.type === "loop") {
		assignCondIds(ctx, p.body);
	}
}

/**
 * Parse a sequence of tokens into a Pattern.
 * Stops (and returns) at loop_end / if_end / else — the caller decides what to
 * do with the stop token.
 *
 * Returns [pattern, stopIndex, stopReason]
 *   stopIndex:  index of the token that caused the stop (or tokens.length for 'end')
 *   stopReason: why we stopped
 */
function parseSequence(
	tokens: Token[],
	startIndex: number,
): [Pattern, number, StopReason] {
	const parts: Pattern[] = [];
	let i = startIndex;

	while (i < tokens.length) {
		const token = tokens[i];

		// ── Stop tokens ──────────────────────────────────────────────────────────
		if (
			token.type === "loop_end" ||
			token.type === "if_end" ||
			token.type === "else"
		) {
			return [wrap(parts), i, token.type];
		}

		// ── Leaf tokens ──────────────────────────────────────────────────────────
		if (token.type === "literal") {
			parts.push({ type: "literal", value: token.value });
			i++;
		} else if (token.type === "variable") {
			parts.push({ type: "variable", name: token.name });
			i++;

			// ── Loop ─────────────────────────────────────────────────────────────────
		} else if (token.type === "loop_start") {
			const [body, endIdx] = parseSequence(tokens, i + 1);
			parts.push({
				type: "loop",
				arrayName: token.arrayName,
				itemName: token.itemName,
				body,
				loopVar: token.loopVar,
			});
			i = endIdx + 1; // skip loop_end

			// ── Conditional ──────────────────────────────────────────────────────────
		} else if (token.type === "if_start") {
			const [thenBranch, stopIdx, stopReason] = parseSequence(
				tokens,
				i + 1,
			);

			if (stopReason === "else") {
				const [elseBranch, endIdx] = parseSequence(tokens, stopIdx + 1);
				parts.push({
					type: "conditional",
					thenBranch,
					elseBranch,
					condition: token.condition,
				});
				i = endIdx + 1;
			} else {
				parts.push({
					type: "conditional",
					thenBranch,
					condition: token.condition,
				});
				i = stopIdx + 1;
			}
		} else {
			i++;
		}
	}

	return [wrap(parts), i, "end"];
}

function wrap(parts: Pattern[]): Pattern {
	if (parts.length === 0) return { type: "literal", value: "" };
	if (parts.length === 1) return parts[0];
	return { type: "sequence", parts };
}
