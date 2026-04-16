// Benchmark: reverseEjsAll() across 100 rows of a fixed template.
//
// Paired with `match-only`, this number shows the batching advantage
// over calling `reverseEjs()` in a loop yourself. Cache hit on the
// compiled pattern amortizes tokenization + plan build; per-call
// overhead reduces to the match step.

import { reverseEjsAll } from "../../src/index";
import { runBench } from "../lib/runner";
import type { BenchmarkResult } from "../lib/types";

export const id = "batch-100-rows";

const TEMPLATE = "<tr><td><%= name %></td><td><%= score %></td></tr>";
const ROWS: string[] = [];
for (let i = 0; i < 100; i++) {
	ROWS.push(`<tr><td>User${i}</td><td>${i * 3}</td></tr>`);
}

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjsAll() across 100 table-row rendered strings — compile once, match many",
		fn: () => reverseEjsAll(TEMPLATE, ROWS),
	});
}
