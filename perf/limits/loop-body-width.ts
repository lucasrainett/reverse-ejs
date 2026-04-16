// Regex limit, dimension: loop body width.
//
// Loops always compile into a regex (hybrid walker keeps the outer
// structure in code but scopes the loop body to a regex). With many
// variables per loop body, a small iteration count can still produce
// a huge inner regex. This sweep holds iteration count fixed and
// sweeps the body width (variables per iteration) to find the regex
// compiler's cliff on loop bodies.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "loop-body-width";

const ITERATIONS = 10; // rendered loop iteration count, kept small

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			`Loop with ${ITERATIONS} iterations, sweeping the body's variable ` +
			"count; finds the body-width cliff",
		sizes: [10, 50, 100, 500, 1000, 2000, 2500, 3000, 3500, 4000, 5000],
		iterations: 3,
		build(width) {
			let body = "";
			let renderedItem = "";
			for (let i = 0; i < width; i++) {
				body += `<f${i}><%= item.f${i} %></f${i}>`;
				renderedItem += `<f${i}>v${i}</f${i}>`;
			}
			const template = `<% items.forEach(item => { %>${body}<% }) %>`;
			let rendered = "";
			for (let it = 0; it < ITERATIONS; it++) rendered += renderedItem;
			return { template, rendered };
		},
	});
}
