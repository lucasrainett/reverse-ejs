// Output-shape limit, dimension: nested object depth.
//
// Single variable with an N-component dotted path (`a0.a1.a2...aN`)
// produces a nested object N levels deep. Exercises setNested's
// iterative walk + the tokenizer's PLAIN_VAR_RE (which accepts any
// depth of dotted path).
//
// The library itself (iterative setNested) scales far higher than
// downstream consumers: the sweep's cliff is typically JSON.stringify's
// recursive traversal hitting V8's call-stack limit on the result
// object. Users who don't JSON-serialize can go deeper, but anyone who
// does (logging, HTTP responses, diffing) is bounded by this stack.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "max-object-depth";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Single variable with an N-component dotted path; finds the " +
			"nested-object-depth ceiling",
		sizes: [10, 100, 1_000, 5_000, 10_000, 50_000, 100_000],
		iterations: 1,
		build(n) {
			const parts: string[] = [];
			for (let i = 0; i < n; i++) parts.push(`a${i}`);
			const path = parts.join(".");
			return {
				template: `<%= ${path} %>`,
				rendered: "leaf-value",
			};
		},
	});
}
