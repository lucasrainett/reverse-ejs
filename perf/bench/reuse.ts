// Benchmark: validates the documented "compile once, match many" speedup.
// The ratio between this and `extract.ts × 100` is the actual real-world
// gain for batch processing.

import { compileTemplate, reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { PRODUCT_TEMPLATE, PRODUCT_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "reuse-vs-fresh-100x";

export function run(): BenchmarkResult {
	const compiled = compileTemplate(PRODUCT_TEMPLATE);
	const compiledMs = runBench({
		description: "compileTemplate() once + match() 100 times",
		fn: () => {
			for (let i = 0; i < 100; i++) compiled.match(PRODUCT_RENDERED);
		},
	});
	const freshMs = runBench({
		description: "reverseEjs() called 100 times (compile each)",
		fn: () => {
			for (let i = 0; i < 100; i++)
				reverseEjs(PRODUCT_TEMPLATE, PRODUCT_RENDERED);
		},
	});
	// Synthesize a single result that captures the ratio so the JSON shape
	// stays uniform with other benchmarks. Median of the *speedup* over the
	// fresh-compile case.
	return {
		...compiledMs,
		description: `reuse vs fresh: ${(freshMs.median_ms / compiledMs.median_ms).toFixed(2)}x speedup over reverseEjs() in a loop`,
	};
}
