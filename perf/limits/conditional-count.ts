// Regex limit, dimension: number of conditionals in a template.
//
// Conditionals always go through the regex path — each `<% if (X) { %>
// ...<% } else { %>...<% } %>` becomes a `(?:then|else)` alternation
// inside the compiled regex. Many independent conditions multiply the
// alternation count, which V8's regex engine handles less efficiently
// than plain capture groups. This sweep finds the alternation cliff.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "conditional-count";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"N independent if/else blocks (each with a literal in each branch); " +
			"finds the alternation cliff",
		sizes: [10, 50, 100, 500, 1000, 2000, 2500, 3000, 3500, 4000, 5000],
		iterations: 3,
		build(n) {
			let template = "";
			let rendered = "";
			for (let i = 0; i < n; i++) {
				template += `<% if (c${i}) { %>Y${i}<% } else { %>N${i}<% } %>`;
				// Alternate branches to exercise both sides
				rendered += i % 2 === 0 ? `Y${i}` : `N${i}`;
			}
			return { template, rendered };
		},
	});
}
