// PR comparison report.
//
// Usage: tsx perf/compare.ts <before.json> <after.json> > comment.md
//
// Reads two results.json files (typically master's vs. the PR's), produces a
// Markdown comment ready to post on the PR. Highlights regressions ≥ 10%.

import { readFileSync, existsSync } from "node:fs";
import type { Results, BenchmarkResult, LimitScenario } from "./lib/types";

const REGRESSION_THRESHOLD_PCT = 10;

const [, , beforePath, afterPath] = process.argv;
if (!afterPath) {
	console.error(
		"usage: tsx perf/compare.ts <before.json|''> <after.json>\n" +
			"  Pass an empty first arg (or a non-existent path) for the " +
			"first-run case where no baseline exists yet.",
	);
	process.exit(2);
}

const after: Results = JSON.parse(readFileSync(afterPath, "utf8"));

const before: Results | null =
	beforePath && existsSync(beforePath)
		? JSON.parse(readFileSync(beforePath, "utf8"))
		: null;

const lines: string[] = [];

lines.push("## Performance impact");
lines.push("");
lines.push(
	`**Commit**: \`${after.commit}\` &middot; **Runner**: \`${after.platform.runner}\` &middot; ` +
		`**Node**: \`${after.platform.node}\` (V8 ${after.platform.v8})`,
);
lines.push("");

if (!before) {
	lines.push(
		"_No baseline `perf/results.json` found on master — this is the first run. " +
			"Subsequent PRs will see a comparison table here._",
	);
	lines.push("");
}

// ── Limit scenarios ─────────────────────────────────────────────

lines.push("### Limits (largest N that succeeded)");
lines.push("");
lines.push("| Scenario | Before | After | Δ |");
lines.push("|---|---:|---:|---|");

const limitIds = new Set([
	...Object.keys(after.limits),
	...Object.keys(before?.limits ?? {}),
]);
for (const id of [...limitIds].sort()) {
	const b = before?.limits[id];
	const a = after.limits[id];
	const beforeN = b ? lastN(b) : "—";
	const afterN = a ? lastN(a) : "—";
	const delta = limitDelta(b, a);
	lines.push(`| \`${id}\` | ${beforeN} | ${afterN} | ${delta} |`);
}
lines.push("");

// ── Benchmarks ──────────────────────────────────────────────────

lines.push("### Benchmarks (median ms, lower is better)");
lines.push("");
lines.push("| Benchmark | Before | After | Δ % | Status |");
lines.push("|---|---:|---:|---:|:--:|");

const benchIds = new Set([
	...Object.keys(after.benchmarks),
	...Object.keys(before?.benchmarks ?? {}),
]);
for (const id of [...benchIds].sort()) {
	const b = before?.benchmarks[id];
	const a = after.benchmarks[id];
	const beforeMs = b ? fmtMs(b.median_ms) : "—";
	const afterMs = a ? fmtMs(a.median_ms) : "—";
	const { pct, status } = benchDelta(b, a);
	lines.push(
		`| \`${id}\` | ${beforeMs} | ${afterMs}${a?.noisy ? " ⚠" : ""} | ${pct} | ${status} |`,
	);
}
lines.push("");

lines.push(
	`> ⚠ marks measurements with stddev > 15% (treat as noisy). ` +
		`Regression threshold: ±${REGRESSION_THRESHOLD_PCT}%.`,
);

console.log(lines.join("\n"));

// ── Helpers ─────────────────────────────────────────────────────

function lastN(s: LimitScenario): string {
	if (s.limit) return String(s.limit.lastSuccessfulN ?? 0);
	const last = s.samples.at(-1);
	return last ? `${last.n} (no fail)` : "—";
}

function limitDelta(
	b: LimitScenario | undefined,
	a: LimitScenario | undefined,
): string {
	if (!b || !a) return "—";
	const bn = b.limit?.lastSuccessfulN ?? b.samples.at(-1)?.n ?? 0;
	const an = a.limit?.lastSuccessfulN ?? a.samples.at(-1)?.n ?? 0;
	if (bn === an) return "—";
	if (an > bn) return `+${an - bn} 🟢`;
	return `${an - bn} 🔴`;
}

function fmtMs(ms: number): string {
	if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
	if (ms < 100) return `${ms.toFixed(2)}ms`;
	return `${ms.toFixed(0)}ms`;
}

function benchDelta(
	b: BenchmarkResult | undefined,
	a: BenchmarkResult | undefined,
): { pct: string; status: string } {
	if (!b || !a) return { pct: "—", status: "new" };
	if (b.median_ms === 0) return { pct: "—", status: "—" };
	const pct = ((a.median_ms - b.median_ms) / b.median_ms) * 100;
	const sign = pct >= 0 ? "+" : "";
	const pctStr = `${sign}${pct.toFixed(1)}%`;
	let status = "✅";
	if (pct >= REGRESSION_THRESHOLD_PCT) status = "🔴 slower";
	else if (pct <= -REGRESSION_THRESHOLD_PCT) status = "🟢 faster";
	return { pct: pctStr, status };
}
