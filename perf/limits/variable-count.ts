// Capture-count limit, dimension: number of <%= varI %> tags.
//
// Builds a template with N independent variables separated by short
// literal anchors. The shape (literals + unique captures, no loops, no
// conditionals) qualifies for the capture-only fast path, so no regex
// is built — the ceiling is the walker's segment-list allocation and
// the final nested-object size, not V8's named-capture cap.
//
// Historically this probed V8's ~32K capture-group cap; the fast path
// made that cap unreachable by this shape.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "variable-count";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"N independent <%= varI %> tags separated by short literals; " +
			"finds the fast-path capture-count ceiling",
		sizes: [
			100, 500, 1000, 2000, 2500, 3000, 3500, 4000, 5000, 8000, 16000,
			32000, 32767, 32768,
		],
		iterations: 3,
		build(n) {
			let template = "";
			let rendered = "";
			for (let i = 0; i < n; i++) {
				// Literal anchors between variables disambiguate each
				// capture's boundary. Without them, adjacent variables
				// fold into a single joined-key capture and defeat
				// the sweep's intent.
				template += `<a${i}><%= v${i} %></a${i}>`;
				rendered += `<a${i}>val${i}</a${i}>`;
			}
			return { template, rendered };
		},
	});
}
