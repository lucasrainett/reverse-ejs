import type { Token, Pattern } from "./types";

type StopReason = "loop_end" | "if_end" | "else" | "end";

export function buildPattern(tokens: Token[]): Pattern {
	const [pattern] = parseSequence(tokens, 0);
	assignCondIds({ n: 0 }, pattern);
	assignExprIds({ n: 0, map: new Map() }, pattern);
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

function assignExprIds(
	ctx: { n: number; map: Map<string, number> },
	p: Pattern,
): void {
	if (p.type === "expression") {
		const existing = ctx.map.get(p.expression);
		if (existing !== undefined) {
			(p as { exprId: number }).exprId = existing;
		} else {
			const id = ctx.n++;
			ctx.map.set(p.expression, id);
			(p as { exprId: number }).exprId = id;
		}
	} else if (p.type === "sequence") {
		p.parts.forEach((c) => assignExprIds(ctx, c));
	} else if (p.type === "loop") {
		assignExprIds(ctx, p.body);
	} else if (p.type === "conditional") {
		assignExprIds(ctx, p.thenBranch);
		if (p.elseBranch) assignExprIds(ctx, p.elseBranch);
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
		} else if (token.type === "expression") {
			parts.push({
				type: "expression",
				expression: token.expression,
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

/**
 * Merge runs of consecutive variable/expression nodes into a single expression
 * node. The merged expression text joins each part with " + " (mirroring JS
 * string concatenation), so `<%= a %><%= b %>` collapses to a single
 * expression with text `"a + b"`.
 */
function mergeAdjacent(parts: Pattern[]): Pattern[] {
	const result: Pattern[] = [];
	let buffer: Pattern[] = [];
	const flush = (): void => {
		if (buffer.length === 0) return;
		if (buffer.length === 1) {
			result.push(buffer[0]);
		} else {
			const exprText = buffer
				.map((p) =>
					p.type === "variable"
						? p.name
						: (p as { expression: string }).expression,
				)
				.join(" + ");
			const anyRaw = buffer.some(
				(p) =>
					(p.type === "variable" || p.type === "expression") && p.raw,
			);
			result.push({
				type: "expression",
				expression: exprText,
				...(anyRaw ? { raw: true } : {}),
			});
		}
		buffer = [];
	};
	for (const p of parts) {
		if (p.type === "variable" || p.type === "expression") {
			buffer.push(p);
		} else {
			flush();
			result.push(p);
		}
	}
	flush();
	return result;
}

function wrap(parts: Pattern[]): Pattern {
	const merged = mergeAdjacent(parts);
	if (merged.length === 0) return { type: "literal", value: "" };
	if (merged.length === 1) return merged[0];
	return { type: "sequence", parts: merged };
}
