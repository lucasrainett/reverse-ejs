// Benchmark: cost of `flexibleWhitespace: true`.
// The flex regex is much denser (every literal whitespace becomes \s* with
// extra anchoring around tags), so it should measurably slow extraction.
// This benchmark reports the WITH-flex timing; compare against
// `extract-product-page` to compute the overhead ratio.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { PRODUCT_TEMPLATE, PRODUCT_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "extract-with-flexws";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() with flexibleWhitespace: true (compare to " +
			"extract-product-page for overhead ratio)",
		fn: () =>
			reverseEjs(PRODUCT_TEMPLATE, PRODUCT_RENDERED, {
				flexibleWhitespace: true,
			}),
	});
}
