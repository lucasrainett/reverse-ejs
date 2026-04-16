// Benchmark: partial-expansion overhead on a typical layout shape.
//
// Template with 2 `<%- include(...) %>` references wrapping a main
// section. Every `reverseEjs()` call pays include expansion once per
// compile; the LRU cache amortizes it across calls with the same
// (template, partials) key. This measures a warm-cache extract.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import {
	PARTIAL_TEMPLATE,
	PARTIAL_PARTIALS,
	PARTIAL_RENDERED,
} from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "partial-expansion";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() on a layout with 2 partial includes (cache-warm)",
		fn: () =>
			reverseEjs(PARTIAL_TEMPLATE, PARTIAL_RENDERED, {
				partials: PARTIAL_PARTIALS,
			}),
	});
}
