/**
 * Normalize an expression string for use as a result-object key.
 *
 * - Trims leading/trailing whitespace
 * - Collapses internal whitespace runs to single spaces
 * - Adds spaces around clearly-binary arithmetic operators (`*`, `/`, `%`)
 *   when they sit directly between word characters, so `price*qty` and
 *   `price * qty` produce the same key.
 *
 * Conservative on purpose - we don't try to normalize `+`/`-` (could be
 * unary) or `<`/`>` (might appear in JSX-like content).
 */
export function normalizeExpression(s: string): string {
	let result = s.trim().replace(/\s+/g, " ");
	// Add spaces around *, /, % when they sit between word characters
	// (alphanumeric / underscore on both sides). Run twice to catch chains.
	for (let i = 0; i < 2; i++) {
		result = result.replace(/(\w)([*/%])(\w)/g, "$1 $2 $3");
	}
	return result.replace(/\s+/g, " ").trim();
}

import { escapeRegex } from "./regexBuilder";

/**
 * Strip a loop item prefix from an expression. Used inside loop body
 * extraction so that `item.price * item.qty` becomes `price * qty` when
 * `itemName` is `"item"`.
 */
export function stripItemPrefix(expr: string, itemName: string): string {
	if (!itemName) return expr;
	const re = new RegExp(`\\b${escapeRegex(itemName)}\\.`, "g");
	return expr.replace(re, "");
}
