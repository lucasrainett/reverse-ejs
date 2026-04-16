// Dedicated regression benchmark for the unescape fast-path (skip regex
// when the value contains no `&`). Two variants of the same template and
// rendering — one triggers the fast path, one does not. The ratio between
// them should stay roughly 2-3× on non-HTML values. If a future refactor
// accidentally removes the fast-path check, both numbers converge and the
// cache-effectiveness ratio collapses.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import type { BenchmarkResult } from "../lib/types";

export const id = "unescape-fast-path-vs-slow";

const TEMPLATE = "<%= msg %>";
// 5 KB of plain text with no HTML entities — hits the fast path.
const PLAIN = "a".repeat(5000);
// 5 KB of text with entities — falls through to the regex replace.
const ENTITIES = (" &amp; " + "a".repeat(4)).repeat(500);

export function run(): BenchmarkResult {
	// We run both and combine into a single result whose `description`
	// encodes the ratio. The median_ms field reports the SLOW path so a
	// regression there is directly comparable to other absolute measures.
	const fast = runBench({
		description: "unescape fast path (value has no `&`)",
		fn: () => {
			reverseEjs(TEMPLATE, PLAIN);
		},
	});
	const slow = runBench({
		description: "unescape slow path (value has entities)",
		fn: () => {
			reverseEjs(TEMPLATE, ENTITIES);
		},
	});
	const ratio = (slow.median_ms / fast.median_ms).toFixed(2);
	return {
		...slow,
		description: `unescape: slow path ${slow.median_ms.toFixed(3)}ms, fast path ${fast.median_ms.toFixed(3)}ms (${ratio}× ratio — regression if ratio < 1.5)`,
	};
}
