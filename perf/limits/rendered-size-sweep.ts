// Input limit, dimension: rendered text size.
//
// Holds the template constant (one variable inside small literals) and grows
// the rendered text by inflating the variable's own value. This isolates the
// regex.exec runtime cost from regex compile cost. Confirms whether the
// library scales linearly with input size and finds where it OOMs / hangs.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "rendered-size-sweep";

const TEMPLATE = "Hello, <%= name %>!";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Fixed simple template, varying rendered-text size by inflating " +
			"the value of one variable; finds the input-size cliff",
		// Doubling roughly. V8's default string length cap is ~1 GB; push
		// to 1 GB and see whether match time scales linearly or cliffs.
		// Each sample allocates the full rendered string so CI memory is
		// the practical ceiling (GitHub runners have 16 GB).
		sizes: [
			1_000, 10_000, 100_000, 1_000_000, 5_000_000, 10_000_000,
			50_000_000, 100_000_000, 256_000_000, 512_000_000, 1_000_000_000,
		],
		iterations: 1, // each iteration allocates the full rendered string
		build(bytes) {
			const filler = "x".repeat(bytes);
			return {
				template: TEMPLATE,
				rendered: `Hello, ${filler}!`,
			};
		},
	});
}
