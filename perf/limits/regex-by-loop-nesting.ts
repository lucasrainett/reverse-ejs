// Regex limit, dimension: loop nesting depth.
//
// Each level of forEach nesting wraps the inner regex in another `(?:...)*`
// repeater. Deep nesting compounds regex complexity multiplicatively because
// the matcher must explore each level's repetitions.
//
// At each level the rendered text iterates only ONCE so the total matched
// content stays small — we're stress-testing the regex shape, not the input
// size.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "regex-by-loop-nesting";

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
