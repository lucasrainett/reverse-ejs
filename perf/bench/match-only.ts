// Measures match + extract cost with compile amortized away. Paired with
// `compile-cold`, these two numbers let you compute any sensible ratio
// (cache speedup, compile share of total, etc.) without an opaque
// "reuse-vs-fresh" benchmark in the middle.

import { compileTemplate } from "../../src/index";
import { runBench } from "../lib/runner";
import { PRODUCT_TEMPLATE, PRODUCT_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "match-only";

export function run(): BenchmarkResult {
	// Compile once outside the timed loop.
	const compiled = compileTemplate(PRODUCT_TEMPLATE);
	return runBench({
		description:
			"compiled.match() on a pre-compiled template — no compile cost in the hot path",
		fn: () => {
			compiled.match(PRODUCT_RENDERED);
		},
	});
}
