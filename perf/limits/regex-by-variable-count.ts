// Regex limit, dimension: number of variables.
//
// Builds a template with N independent <%= varI %> tags, each separated by a
// short literal, and a matching rendered string. Every variable becomes a
// named capture group in the generated regex, so regex byte-size grows
// roughly linearly with N. This script finds the N at which the V8 regex
// engine refuses to compile the result.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "regex-by-variable-count";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"N independent <%= varI %> tags separated by short literals; " +
			"finds the regex size / capture-group cliff",
		sizes: [
			100, 500, 1000, 2000, 2500, 3000, 3500, 4000, 5000, 8000, 16000,
			32000, 32767, 32768,
		],
		iterations: 3,
		build(n) {
			let template = "";
			let rendered = "";
			for (let i = 0; i < n; i++) {
				// `<a>` separators give the regex something to anchor to; without
				// literals between vars the matcher becomes ambiguous and gets
				// folded into a single joined-key capture (v3 behavior), which
				// would defeat the test.
				template += `<a${i}><%= v${i} %></a${i}>`;
				rendered += `<a${i}>val${i}</a${i}>`;
			}
			return { template, rendered };
		},
	});
}
