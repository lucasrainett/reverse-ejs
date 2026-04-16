// Recursion limit, dimension: loop nesting depth.
//
// Each level of forEach nesting adds a level of recursion to every
// pattern-tree walk in the library (buildRegex, buildPattern,
// assignCondIds, assignExprIds). The cliff is typically our own call
// stack hitting V8's ~10K limit during compile, not the regex engine.
//
// At each level the rendered text iterates only ONCE so the total
// matched content stays small — we're measuring pattern-depth, not
// input size.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "loop-nesting-depth";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"N levels of nested forEach, each with one variable; finds the " +
			"nested-loop depth cliff",
		sizes: [
			1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 3000, 5000, 10000,
		],
		iterations: 3,
		build(depth) {
			let template = "";
			let close = "";
			let rendered = "";
			for (let i = 0; i < depth; i++) {
				template += `<% xs${i}.forEach(item${i} => { %><l${i}><%= item${i}.v %></l${i}>`;
				close = `<% }) %>` + close;
				rendered += `<l${i}>val${i}`;
			}
			template += close;
			for (let i = depth - 1; i >= 0; i--) rendered += `</l${i}>`;
			return { template, rendered };
		},
	});
}
