// Input limit, dimension: literal mass around a small capture.
//
// This is the real user workflow after they add their first <%= %> tag
// to a pasted HTML page. Before the capture-only fast path the regex
// source was literal-surrounding-text verbatim, so a 40KB page broke
// V8's regex compiler. With the fast path the walk uses indexOf for
// each literal boundary — no regex, no cap.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "literal-with-capture-size";

// Same BLOCK shape as pure-literal-size so the two sweeps are directly
// comparable (one capture added is the only difference).
const BLOCK =
	'<article class="post" data-tags="[a|b]">' +
	"<h2>Title goes here (part 1).</h2>" +
	'<p>Body text with &amp; and <a href="/x?a=1&amp;b=2*">a link</a>.</p>' +
	"<pre>{ code: [1, 2] }</pre>" +
	"</article>\n";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Big literal mass surrounding a single <%= who %> capture; " +
			"confirms the capture-only fast path lifts the ~40KB regex cliff",
		// N BLOCKs on each side of the capture → ~388 bytes * N * 2 of
		// literal. The regex path would cliff around N=100; the fast path
		// should scale linearly to 10MB+.
		sizes: [100, 1_000, 10_000, 25_000],
		iterations: 1,
		build(n) {
			const pad = BLOCK.repeat(n);
			return {
				template: `${pad}<name><%= who %></name>${pad}`,
				rendered: `${pad}<name>Alice</name>${pad}`,
			};
		},
	});
}
