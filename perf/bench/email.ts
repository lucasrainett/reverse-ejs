// Realistic-corpus benchmark: transactional email with long literal
// content and sparse variables. This shape stresses the regex engine's
// literal-matching path (lots of escaped literal text between captures)
// which is different from the HTML-heavy or CSV-tight cases.

import { reverseEjs } from "../../src/index";
import { runBench } from "../lib/runner";
import type { BenchmarkResult } from "../lib/types";

export const id = "extract-email";

const EMAIL_TEMPLATE =
	`Dear <%= customer %>,\n\n` +
	`Your order <%= orderId %> shipped on <%= shipDate %>. We estimate delivery ` +
	`by <%= eta %>. You can track your package at any time at the link below — ` +
	`this link is unique to your shipment and will stop working once the ` +
	`package is delivered.\n\n` +
	`Tracking: <%= trackingUrl %>\n\n` +
	`Thank you for your business! If you have questions about this order or ` +
	`need to make a change, reply directly to this email or reach our ` +
	`support team at support@acme.example. We're here to help.\n\n` +
	`-- The Acme team\n` +
	`123 Commerce Ave\n` +
	`Metropolis, Earth\n`;

const EMAIL_RENDERED =
	`Dear Alice Chen,\n\n` +
	`Your order #A-12345 shipped on 2026-04-16. We estimate delivery ` +
	`by 2026-04-18. You can track your package at any time at the link below — ` +
	`this link is unique to your shipment and will stop working once the ` +
	`package is delivered.\n\n` +
	`Tracking: https://acme.example/t/A-12345\n\n` +
	`Thank you for your business! If you have questions about this order or ` +
	`need to make a change, reply directly to this email or reach our ` +
	`support team at support@acme.example. We're here to help.\n\n` +
	`-- The Acme team\n` +
	`123 Commerce Ave\n` +
	`Metropolis, Earth\n`;

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjs() on a transactional email — long literal content, sparse variables",
		fn: () => {
			reverseEjs(EMAIL_TEMPLATE, EMAIL_RENDERED);
		},
	});
}
