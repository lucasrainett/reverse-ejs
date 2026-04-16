// Benchmark: ~30KB HTML page with 5 scalars + a 50-item loop.
//
// Target shape for the hybrid walker: big literal mass sandwiching
// a loop and some outer captures. Before the hybrid walker this
// kind of page would have exceeded V8's regex cap; now it walks
// the outer literals with indexOf and only the loop body compiles
// to a (tiny) regex.
//
// Compare against `extract-product-page` to see how literal size
// affects extract cost at realistic scale.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { LARGE_PAGE_TEMPLATE, LARGE_PAGE_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "large-page-hybrid";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() on a 30KB page with 5 scalars + a 50-item loop — hybrid walker",
		fn: () => reverseEjs(LARGE_PAGE_TEMPLATE, LARGE_PAGE_RENDERED),
	});
}
