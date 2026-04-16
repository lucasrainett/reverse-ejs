// Measures the full compile pipeline (tokenize + buildPattern + buildRegex)
// on a cache MISS — i.e. what a one-shot user sees on their first call.
// Since v3.0.2 `compileTemplate()` uses an internal LRU cache, so the
// default case is cache-hit (~1μs) — not representative of the work the
// compiler actually does. We force cache misses by generating a unique
// template string per call.

import { compileTemplate } from "../../src/index";
import { runBench } from "../lib/runner";
import type { BenchmarkResult } from "../lib/types";

export const id = "compile-cold";

// A template with enough structural variety to exercise the compiler
// (variables + one loop + one conditional) while staying representative.
function buildUniqueTemplate(n: number): string {
	return (
		`<!-- ${n} -->` +
		`<div class="p"><h1><%= name %></h1>` +
		`<span class="price">$<%= price %></span>` +
		`<% if (onSale) { %><em>SALE</em><% } %>` +
		`<ul><% items.forEach(i => { %><li><%= i.x %></li><% }) %></ul>` +
		`</div>`
	);
}

export function run(): BenchmarkResult {
	let counter = 0;
	return runBench({
		description:
			"compileTemplate() on a unique template each call (cache miss)",
		fn: () => {
			compileTemplate(buildUniqueTemplate(counter++));
		},
	});
}
