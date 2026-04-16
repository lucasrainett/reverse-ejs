// Benchmark: full compile cost (tokenize + buildPattern + buildRegex) for a
// representative product-page template. Establishes the per-template setup
// cost — important for one-shot reverseEjs() callers.

import { compileTemplate } from "../../src/index";
import { runBench } from "../lib/runner";
import { PRODUCT_TEMPLATE } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "compile-product-page";

export function run(): BenchmarkResult {
	return runBench({
		description: "compileTemplate() on the typical product-page template",
		fn: () => compileTemplate(PRODUCT_TEMPLATE),
	});
}
