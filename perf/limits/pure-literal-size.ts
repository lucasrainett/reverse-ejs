// Input limit, dimension: pure-literal template size.
//
// Models a realistic starting workflow: user copies a rendered HTML page
// into an .ejs file verbatim and hasn't added any <%= %> tags yet. The
// template == rendered string exactly; extraction must succeed with {}.
//
// This is distinct from rendered-size-sweep (which has one variable and
// inflates its value). Here every character becomes literal regex text,
// so the regex source is proportional to the template size and hits
// V8's regex compiler cap before V8's string cap.

import { runSweep } from "../lib/runner";
import type { LimitScenario } from "../lib/types";

export const id = "pure-literal-size";

// Realistic HTML block exercising a broad set of regex metacharacters
// (<, >, ", &, /, ., (, ), [, ], {, }, |, *, +) so escapeRegex is fully
// stressed at every sample size.
const BLOCK =
	'<article class="post" data-tags="[a|b]">' +
	"<h2>Title goes here (part 1).</h2>" +
	'<p>Body text with &amp; and <a href="/x?a=1&amp;b=2*">a link</a>.</p>' +
	"<pre>{ code: [1, 2] }</pre>" +
	"</article>\n";

export async function run(): Promise<LimitScenario> {
	return runSweep({
		description:
			"Template with zero EJS tags (pure HTML literal); finds the size " +
			"cliff for the 'paste raw HTML first, add tags later' workflow",
		// BLOCK is ~194 bytes. With the pure-literal fast path in place
		// (compileTemplate swaps the regex for a plain string equality
		// check when the pattern has zero captures/loops/conditionals),
		// there is no regex cap to hit — scaling is linear in template
		// size. Before the fast path, the cliff was ~40KB of regex source
		// (roughly N=200 with this block).
		//
		// Sweep covers up to ~10MB to confirm the common "paste a big HTML
		// page, add tags later" workflow works at realistic page sizes.
		sizes: [100, 1_000, 10_000, 50_000],
		iterations: 1,
		build(n) {
			const page = BLOCK.repeat(n);
			return { template: page, rendered: page };
		},
	});
}
