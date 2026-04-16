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
		// BLOCK is ~130 bytes of template → ~130 bytes of regex source per
		// repetition (every character becomes literal regex text). V8's
		// regex compiler caps well below V8's string cap for this shape —
		// empirically the cliff lands around 33–40KB of regex source,
		// equivalent to roughly a 33KB raw HTML page.
		sizes: [100, 150, 200, 250, 300, 350, 400, 450, 500, 750, 1_000],
		iterations: 1,
		build(n) {
			const page = BLOCK.repeat(n);
			return { template: page, rendered: page };
		},
	});
}
