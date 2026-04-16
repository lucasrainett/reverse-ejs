// Benchmark: full reverseEjs() round-trip on the typical product page —
// the headline number a typical user sees.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { PRODUCT_TEMPLATE, PRODUCT_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "extract-product-page";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() compile + match + extract on the product page",
		fn: () => reverseEjs(PRODUCT_TEMPLATE, PRODUCT_RENDERED),
	});
}
