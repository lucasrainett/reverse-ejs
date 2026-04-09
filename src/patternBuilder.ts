import type { Token, Pattern } from "./types";

type StopReason = "loop_end" | "if_end" | "else" | "end";

export function buildPattern(tokens: Token[]): Pattern {
	const [pattern] = parseSequence(tokens, 0);
	assignCondIds({ n: 0 }, pattern);
	return pattern;
}

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

function parseSequence(
	tokens: Token[],
	startIndex: number,
): [Pattern, number, StopReason] {
	const parts: Pattern[] = [];
	let i = startIndex;

	while (i < tokens.length) {
		const token = tokens[i];

		if (
			token.type === "loop_end" ||
			token.type === "if_end" ||
			token.type === "else"
		) {
			return [wrap(parts), i, token.type];
		}

		if (token.type === "literal") {
			parts.push({ type: "literal", value: token.value });
			i++;
		} else if (token.type === "variable") {
			parts.push({
				type: "variable",
				name: token.name,
				...(token.raw ? { raw: true } : {}),
			});
			i++;
		} else if (token.type === "loop_start") {
			const [body, endIdx] = parseSequence(tokens, i + 1);
			parts.push({
				type: "loop",
				arrayName: token.arrayName,
				itemName: token.itemName,
				body,
				loopVar: token.loopVar,
			});
			i = endIdx + 1;
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
