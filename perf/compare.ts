// Compare two `perf/results.json` snapshots and emit a Markdown report.
//
// Usage:
//   tsx perf/compare.ts <before> <after>
//
// Both arguments can be either a file path OR a git ref. Git refs are
// resolved by running `git show <ref>:perf/results.json`, so you can
// compare any two points in history:
//
//   tsx perf/compare.ts v3.0.1 HEAD
//   tsx perf/compare.ts master perf/results.local.json
//   tsx perf/compare.ts v3.0.0 v3.0.2
//
// Pass an empty first argument (or a non-existent path) for the
// first-run case where no baseline exists yet.

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import type {
	Results,
	BenchmarkResult,
	LimitScenario,
	Sample,
} from "./lib/types";

// Minimum delta (percent) that counts as a real change. Anything smaller
// than combined stddev is treated as noise regardless.
const REGRESSION_THRESHOLD_PCT = 10;

const [, , beforeArg, afterArg] = process.argv;
if (!afterArg) {
	console.error(
		"usage: tsx perf/compare.ts <before> <after>\n" +
			"  Both args are file paths OR git refs (e.g. `v3.0.0`, `HEAD~5`, `master`).\n" +
			"  Pass an empty first arg (or a missing path/ref) to skip the baseline.",
	);
	process.exit(2);
}

const after = resolveSource(afterArg);
if (!after) {
	console.error(
		`Could not resolve "after" source: ${afterArg}\n` +
			`Tried as file path and as git ref (via \`git show <ref>:perf/results.json\`).`,
	);
	process.exit(2);
}

const before = beforeArg ? resolveSource(beforeArg, /*silent*/ true) : null;

const lines: string[] = [];
lines.push("## Performance impact");
lines.push("");

const beforeTag = beforeArg ? labelFor(beforeArg, before) : "(no baseline)";
const afterTag = labelFor(afterArg, after);
lines.push(`**Before**: ${beforeTag} &middot; **After**: ${afterTag}`);
lines.push(
	`**Runner**: \`${after.platform.runner}\` &middot; ` +
		`**Node**: \`${after.platform.node}\` (V8 ${after.platform.v8})`,
);
lines.push("");

if (!before) {
	lines.push(
		"_No baseline found — this is the first comparable run. Subsequent " +
			"PRs will see before/after tables here._",
	);
	lines.push("");
}

// ── Limits ──────────────────────────────────────────────────────

lines.push("### Limits");
lines.push("");
lines.push(
	"`last N` = largest sweep size that succeeded. `regex bytes` = regex " +
		"source size at that N. A shrinking regex at the same N means more " +
		"headroom before V8's cliff.",
);
lines.push("");
lines.push(
	"| Scenario | last N (before → after) | regex bytes (before → after) | Status |",
);
lines.push("|---|---|---|:--|");

const limitIds = new Set([
	...Object.keys(after.limits),
	...Object.keys(before?.limits ?? {}),
]);
for (const id of [...limitIds].sort()) {
	const b = before?.limits[id];
	const a = after.limits[id];
	const status = !b ? "new" : !a ? "removed" : "";
	lines.push(
		`| \`${id}\` | ${limitNCell(b, a)} | ${regexBytesCell(b, a)} | ${status} |`,
	);
}
lines.push("");

// ── Benchmarks ──────────────────────────────────────────────────

lines.push("### Benchmarks");
lines.push("");
lines.push("| Benchmark | Before | After | Δ % | Status |");
lines.push("|---|---:|---:|---:|:--|");

const benchIds = new Set([
	...Object.keys(after.benchmarks),
	...Object.keys(before?.benchmarks ?? {}),
]);
for (const id of [...benchIds].sort()) {
	const b = before?.benchmarks[id];
	const a = after.benchmarks[id];
	const { pct, status } = benchDelta(b, a);
	const beforeCell = b ? fmtMs(b.median_ms) : "—";
	const afterCell = a ? `${fmtMs(a.median_ms)}${a.noisy ? " ⚠" : ""}` : "—";
	lines.push(
		`| \`${id}\` | ${beforeCell} | ${afterCell} | ${pct} | ${status} |`,
	);
}
lines.push("");

lines.push(
	`> **Noise-aware.** Changes smaller than the combined stddev are ` +
		`flagged as ≈ (within noise) rather than regression/improvement. ` +
		`Real regression threshold: ${REGRESSION_THRESHOLD_PCT}% AND outside noise.  ` +
		`⚠ marks measurements with stddev > 15%.`,
);

console.log(lines.join("\n"));

// ── Source resolution ───────────────────────────────────────────

function resolveSource(arg: string, silent = false): Results | null {
	// 1) Try as a local file path.
	if (existsSync(arg)) {
		try {
			return JSON.parse(readFileSync(arg, "utf8")) as Results;
		} catch (e) {
			if (!silent)
				console.error(
					`File "${arg}" exists but is not valid JSON: ${(e as Error).message}`,
				);
			return null;
		}
	}
	// 2) Try as a git ref pointing at `perf/results.json` in that ref.
	try {
		const content = execSync(`git show ${arg}:perf/results.json`, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		return JSON.parse(content) as Results;
	} catch {
		return null;
	}
}

function labelFor(arg: string, r: Results | null): string {
	if (!r) return `\`${arg}\` (not found)`;
	// If the arg looks like a file path, show the version+commit from the
	// JSON. If it's a git ref, show the ref itself.
	const isPath = existsSync(arg);
	const versionTag = `v${r.version}@${r.commit}`;
	return isPath ? `\`${arg}\` (${versionTag})` : `\`${arg}\` (${versionTag})`;
}

// ── Limit formatting ────────────────────────────────────────────

function peakSample(s: LimitScenario | undefined): Sample | undefined {
	if (!s) return undefined;
	return (
		s.samples.find((x) => x.n === s.limit?.lastSuccessfulN) ??
		s.samples.at(-1)
	);
}

function lastN(s: LimitScenario | undefined): number | null {
	if (!s) return null;
	return s.limit?.lastSuccessfulN ?? s.samples.at(-1)?.n ?? null;
}

function limitNCell(
	b: LimitScenario | undefined,
	a: LimitScenario | undefined,
): string {
	const bn = lastN(b);
	const an = lastN(a);
	const bStr = bn == null ? "—" : b?.limit ? String(bn) : `${bn} (no fail)`;
	const aStr = an == null ? "—" : a?.limit ? String(an) : `${an} (no fail)`;
	if (bn == null || an == null) return `${bStr} → ${aStr}`;
	if (bn === an) return `${bStr} → ${aStr}`;
	const delta = an > bn ? `+${an - bn} 🟢` : `${an - bn} 🔴`;
	return `${bStr} → ${aStr} (${delta})`;
}

function regexBytesCell(
	b: LimitScenario | undefined,
	a: LimitScenario | undefined,
): string {
	const bBytes = peakSample(b)?.regexBytes;
	const aBytes = peakSample(a)?.regexBytes;
	if (bBytes == null && aBytes == null) return "—";
	if (bBytes == null) return `— → ${fmtBytes(aBytes!)}`;
	if (aBytes == null) return `${fmtBytes(bBytes)} → —`;
	if (bBytes === aBytes) return `${fmtBytes(bBytes)} → ${fmtBytes(aBytes)}`;
	const pct = (((aBytes - bBytes) / bBytes) * 100).toFixed(0);
	const sign = aBytes < bBytes ? "🟢" : "🔴";
	return `${fmtBytes(bBytes)} → ${fmtBytes(aBytes)} (${pct}% ${sign})`;
}

function fmtBytes(n: number): string {
	if (n < 1000) return `${n}B`;
	return `${(n / 1000).toFixed(1)}KB`;
}

// ── Benchmark formatting ────────────────────────────────────────

function fmtMs(ms: number): string {
	if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
	if (ms < 100) return `${ms.toFixed(2)}ms`;
	return `${ms.toFixed(0)}ms`;
}

function benchDelta(
	b: BenchmarkResult | undefined,
	a: BenchmarkResult | undefined,
): { pct: string; status: string } {
	if (!b && !a) return { pct: "—", status: "—" };
	if (!b) return { pct: "—", status: "new" };
	if (!a) return { pct: "—", status: "removed" };
	if (b.median_ms === 0) return { pct: "—", status: "—" };

	const deltaPct = ((a.median_ms - b.median_ms) / b.median_ms) * 100;
	const sign = deltaPct >= 0 ? "+" : "";
	const pctStr = `${sign}${deltaPct.toFixed(1)}%`;

	// Combined stddev: roughly the noise floor for distinguishing a real
	// delta from variance. Sum-of-squares rather than linear because each
	// measurement's noise is independent.
	const combinedStddevPct = Math.sqrt(
		(b.stddev_pct ?? 0) ** 2 + (a.stddev_pct ?? 0) ** 2,
	);
	// A change needs to be BOTH above the regression threshold AND larger
	// than the combined stddev to count as a real change.
	const noiseFloor = Math.max(REGRESSION_THRESHOLD_PCT, combinedStddevPct);
	const absDelta = Math.abs(deltaPct);

	if (absDelta < noiseFloor) {
		return {
			pct: pctStr,
			status: `≈ within noise (±${combinedStddevPct.toFixed(0)}%)`,
		};
	}
	if (deltaPct >= 0) return { pct: pctStr, status: "🔴 slower" };
	return { pct: pctStr, status: "🟢 faster" };
}
