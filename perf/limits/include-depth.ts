// Functional limit, dimension: nested include depth.
//
// The library has a documented hard cap of 20 levels of recursive includes
// (`Include depth limit exceeded - possible circular include`). This script
// verifies the cap kicks in cleanly and records the exact failure point.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "include-depth";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"N levels of nested partials (each includes the next); verifies " +
			"the include-depth cap",
		sizes: [1, 5, 10, 15, 18, 19, 20, 21, 25, 30, 50],
		iterations: 1,
		build(depth) {
			const partials: Record<string, string> = {};
			for (let i = 0; i < depth - 1; i++) {
				partials[`p${i}`] = `<%- include("p${i + 1}") %>`;
			}
			if (depth >= 1) {
				partials[`p${depth - 1}`] = `<%= value %>`;
			}
			const template = depth === 0 ? "" : `<%- include("p0") %>`;
			return {
				template,
				rendered: depth === 0 ? "" : "X",
				options: { partials },
			};
		},
	});
}
