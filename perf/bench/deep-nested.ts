// Benchmark: 10-level nested-object construction via setNested.
//
// Single variable with a 10-component dotted path. Reveals the
// per-extract cost of setNested's split + per-level object allocation
// in isolation from any other work. Complements `match-only` which
// uses flat keys.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import { DEEP_TEMPLATE, DEEP_RENDERED } from "./fixtures";
import type { BenchmarkResult } from "../lib/types";

export const id = "deep-nested-extraction";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"Extract a single variable with a 10-level dotted path — stresses setNested",
		fn: () => reverseEjs(DEEP_TEMPLATE, DEEP_RENDERED),
	});
}
