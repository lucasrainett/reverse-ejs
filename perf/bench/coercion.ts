// Benchmark: cost of the `types` option (post-extraction string coercion).
// Should be near-zero for a typical page — but if it ever shows up in a flame
// graph, this is the canary that'll catch it.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { PRODUCT_TEMPLATE, PRODUCT_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "extract-with-coercion";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() with types: { price: 'number', rating: 'number' } " +
			"(compare to extract-product-page for overhead)",
		fn: () =>
			reverseEjs(PRODUCT_TEMPLATE, PRODUCT_RENDERED, {
				types: { price: "number", rating: "number" },
			}),
	});
}
