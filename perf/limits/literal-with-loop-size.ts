// Input limit, dimension: literal mass around a loop.
//
// Target shape: a huge static HTML page with a single dynamic loop
// inside. The outer walker handles literals via indexOf; only the loop
// body compiles into a (tiny) regex, sliced to the loop's section of
// the rendered string. Confirms the hybrid walker lifts the ~40KB
// literal-in-regex cliff even when loops are present.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "literal-with-loop-size";

const BLOCK =
	'<article class="post" data-tags="[a|b]">' +
	"<h2>Title goes here (part 1).</h2>" +
	'<p>Body text with &amp; and <a href="/x?a=1&amp;b=2*">a link</a>.</p>' +
	"<pre>{ code: [1, 2] }</pre>" +
	"</article>\n";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Big literal mass surrounding a <% items.forEach %> loop; " +
			"confirms the hybrid fast path lifts the ~40KB regex cliff",
		sizes: [100, 1_000, 10_000, 25_000],
		iterations: 1,
		build(n) {
			const pad = BLOCK.repeat(n);
			const template =
				pad +
				"<ul><% items.forEach(i => { %><li><%= i %></li><% }) %></ul>" +
				pad;
			const rendered =
				pad + "<ul><li>a</li><li>b</li><li>c</li></ul>" + pad;
			return { template, rendered };
		},
	});
}
