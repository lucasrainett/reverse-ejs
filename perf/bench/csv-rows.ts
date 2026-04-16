// Realistic-corpus benchmark: 1000-row CSV via a single reverseEjs call.
// Exercises the tight-loop inner regex path — the work is dominated by
// repeated application of the body regex, not by outer structure.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import type { BenchmarkResult } from "../lib/types";

export const id = "extract-csv-rows";

const CSV_TEMPLATE =
	"Name,Score,City\n" +
	"<% rows.forEach(r => { %>" +
	"<%= r.name %>,<%= r.score %>,<%= r.city %>\n" +
	"<% }) %>";

// 1000 rows. Deterministic, varied enough to not hit V8 regex cache
// shortcuts.
const CITIES = ["Tokyo", "Paris", "Cairo", "Lima", "Oslo"];
const CSV_RENDERED: string =
	"Name,Score,City\n" +
	Array.from({ length: 1000 }, (_, i) => {
		const city = CITIES[i % CITIES.length];
		const score = 50 + ((i * 7) % 50);
		return `User${i},${score},${city}`;
	}).join("\n") +
	"\n";

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() extracting 1000 rows from a CSV table — tight loop inner match",
		fn: () => {
			reverseEjs(CSV_TEMPLATE, CSV_RENDERED);
		},
	});
}
