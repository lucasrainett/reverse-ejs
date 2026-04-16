// Regex limit, dimension: V8 named-capture-group cap.
//
// V8's regex engine has a hard ceiling on how many named capture groups one
// regex can have. This script probes the exact failure point with the
// simplest possible template (one variable per literal pair) so the failure
// is unambiguously the capture-group cap, not regex bytes or some other
// shape concern.
//
// Sweep is dense around the historically-documented ceilings (~32767 from
// Chrome's V8 source, sometimes lower depending on regex shape).

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "capture-group-cap";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Pure adjacent-but-separated <%= varI %> tags; probes V8's named " +
			"capture group ceiling",
		sizes: [
			1000, 2000, 2500, 3000, 3500, 4000, 5000, 8000, 16000, 24000, 30000,
			32000, 32500, 32700, 32760, 32766, 32767, 32768, 33000,
		],
		iterations: 1, // single-shot: we're hunting a hard cap, not statistics
		build(n) {
			let template = "";
			let rendered = "";
			for (let i = 0; i < n; i++) {
				template += `[<%= v${i} %>]`;
				rendered += `[x${i}]`;
			}
			return { template, rendered };
		},
	});
}
