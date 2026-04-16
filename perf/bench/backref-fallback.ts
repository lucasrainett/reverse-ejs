// Benchmark: fallback to the regex path because of a repeated variable.
//
// `<%= t %>` appears twice in the template, so the fast-path plan
// builder rejects (preserves back-reference semantics) and the regex
// path handles the match. Useful when comparing against a capture-only
// shape — the delta is the cost of "forced to regex" vs "walker".

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { BACKREF_TEMPLATE, BACKREF_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "backref-fallback";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() on a template with a repeated variable — forces the regex-path fallback",
		fn: () => reverseEjs(BACKREF_TEMPLATE, BACKREF_RENDERED),
	});
}
