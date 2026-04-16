// Output-shape limit, dimension: extracted array size.
//
// Fixed tiny template `<% items.forEach(i => { %><li><%= i %></li><% }) %>`,
// rendered string has N items. Exercises `extractLoopItems`' `while (exec)`
// loop, per-iteration allocation, and the returned array's size.
//
// The library itself has no cap on loop iteration count; the ceiling is
// the rendered string's length (V8's ~1GB cap on strings) divided by
// per-item bytes.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "max-loop-iterations";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Fixed loop body; scale the rendered array to N items to find " +
			"the extraction-loop iteration ceiling",
		sizes: [100, 1_000, 10_000, 100_000, 1_000_000],
		iterations: 1,
		build(n) {
			let rendered = "";
			for (let i = 0; i < n; i++) rendered += `<li>item-${i}</li>`;
			return {
				template: "<% items.forEach(i => { %><li><%= i %></li><% }) %>",
				rendered,
			};
		},
	});
}
