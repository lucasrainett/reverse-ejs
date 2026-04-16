// Input limit, dimension: partial references per template.
//
// Template inlines N distinct partials back-to-back, each partial
// containing one unique variable. After `expandIncludes` runs, the
// resulting expanded template has N captures — so this is effectively
// a stress test for include expansion + the post-expansion regex shape.
//
// Distinct from `include-depth` which measures LINEAR recursion depth
// (hardcoded cap of 20). This one measures BREADTH — how many partials
// a template can reference in a single pass.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "max-partial-breadth";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Template inlines N distinct partials each with one variable; " +
			"finds the include-expansion breadth ceiling",
		sizes: [10, 100, 500, 1_000, 2_000, 5_000],
		iterations: 1,
		build(n) {
			const partials: Record<string, string> = {};
			let template = "";
			let rendered = "";
			for (let i = 0; i < n; i++) {
				partials[`p${i}`] = `<span><%= v${i} %></span>`;
				template += `<%- include("p${i}") %>`;
				rendered += `<span>val${i}</span>`;
			}
			return { template, rendered, options: { partials } };
		},
	});
}
