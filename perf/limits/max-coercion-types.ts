// Post-process limit, dimension: type coercion entries.
//
// Template with N distinct variables, every one declared in `types`
// with coercion "number". Measures how `applyCoercions`'s Object.entries
// walk over the result scales, plus the coerceValue conversion cost.
//
// Expected to scale linearly with N. Interesting data point: at what
// point does the coercion pass dominate the total extraction time?

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";
import type { CoercionType } from "../../src/types";

export const id = "max-coercion-types";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"N distinct numeric variables all with type coercion; finds " +
			"the applyCoercions entries-walk ceiling",
		sizes: [100, 1_000, 5_000, 10_000, 20_000, 30_000],
		iterations: 1,
		build(n) {
			let template = "";
			let rendered = "";
			const types: Record<string, CoercionType> = {};
			for (let i = 0; i < n; i++) {
				template += `<v${i}><%= v${i} %></v${i}>`;
				rendered += `<v${i}>${i}</v${i}>`;
				types[`v${i}`] = "number";
			}
			return { template, rendered, options: { types } };
		},
	});
}
