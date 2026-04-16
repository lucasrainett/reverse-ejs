// Performance suite orchestrator.
//
// Runs every limit scenario and benchmark, merges results into the canonical
// `perf/results.json` file. Designed to run identically locally and in CI so
// the JSON diff between commits is the regression signal.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { hostname } from "node:os";

import type { LimitScenario, BenchmarkResult, Results } from "./lib/types";

// ── Limit scenarios ─────────────────────────────────────────────

const limitModules = [
	() => import("./limits/regex-by-variable-count"),
	() => import("./limits/regex-by-loop-body"),
	() => import("./limits/regex-by-loop-nesting"),
	() => import("./limits/regex-by-conditionals"),
	() => import("./limits/capture-group-cap"),
	() => import("./limits/rendered-size-sweep"),
	() => import("./limits/pure-literal-size"),
	() => import("./limits/literal-with-capture-size"),
	() => import("./limits/literal-with-loop-size"),
	() => import("./limits/include-depth"),
	// Output-shape / post-process extremes — dimensions beyond regex size
	() => import("./limits/max-object-depth"),
	() => import("./limits/max-loop-iterations"),
	() => import("./limits/max-partial-breadth"),
	() => import("./limits/max-coercion-types"),
];

// ── Benchmarks ──────────────────────────────────────────────────

const benchmarkModules: Array<
	() => Promise<{
		id: string;
		run: () => BenchmarkResult | Promise<BenchmarkResult>;
	}>
> = [
	// Pipeline isolation — paired so ratios are computable
	() => import("./bench/compile"), // cache-cold compile cost
	() => import("./bench/match-only"), // pre-compiled match+extract
	() => import("./bench/extract"), // full reverseEjs (cache hit)
	// Option-overhead (compare against extract-product-page for delta)
	() => import("./bench/flexws"),
	() => import("./bench/coercion"),
	// Dedicated optimization-regression benches
	() => import("./bench/unescape-paths"),
	// Realistic workloads — catch regressions the synthetic bench misses
	() => import("./bench/log-lines"),
	() => import("./bench/csv-rows"),
	() => import("./bench/email"),
];

// ── Main ────────────────────────────────────────────────────────

const onlyLimits = process.argv.includes("--limits");
const onlyBench = process.argv.includes("--bench");

async function main() {
	const limits: Record<string, LimitScenario> = {};
	if (!onlyBench) {
		for (const load of limitModules) {
			const mod = await load();
			console.log(`▶ limit: ${mod.id}`);
			const result = await mod.run();
			limits[mod.id] = result;
			summarizeLimit(mod.id, result);
		}
	}

	const benchmarks: Record<string, BenchmarkResult> = {};
	if (!onlyLimits) {
		for (const load of benchmarkModules) {
			const mod = await load();
			console.log(`▶ bench: ${mod.id}`);
			const result = await mod.run();
			benchmarks[mod.id] = result;
			summarizeBench(mod.id, result);
		}
	}

	const out: Results = {
		version: readVersion(),
		commit: readCommit(),
		ranAt: new Date().toISOString(),
		platform: {
			node: process.version,
			v8: process.versions.v8,
			os: process.platform,
			arch: process.arch,
			runner: process.env.GITHUB_ACTIONS
				? `github/${process.env.RUNNER_OS}-${process.env.RUNNER_ARCH}`
				: `local/${hostname()}`,
		},
		limits,
		benchmarks,
	};

	// CI writes to the committed `perf/results.json` (the canonical file
	// that drives PR comparison comments). Local runs write to
	// `perf/results.local.json` so they don't dirty the tracked file —
	// `.gitignore` can't stop modifications to an already-tracked file,
	// so we side-step the issue by using a different path.
	const path = resolve(
		process.env.CI ? "perf/results.json" : "perf/results.local.json",
	);
	writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
	console.log(`\n✔ wrote ${path}`);
}

function summarizeLimit(id: string, r: LimitScenario) {
	const last = r.limit?.lastSuccessfulN ?? r.samples.at(-1)?.n;
	const failure = r.limit
		? `failed at N=${r.limit.n} (${r.limit.stage}) → ${r.limit.reason}`
		: "no failure (sweep ran to max)";
	console.log(`  last successful N=${last}, ${failure}`);
}

function summarizeBench(id: string, r: BenchmarkResult) {
	const noisy = r.noisy ? " ⚠ NOISY" : "";
	console.log(
		`  median=${r.median_ms.toFixed(3)}ms (${r.ops_per_sec.toFixed(0)} ops/s, σ=${r.stddev_pct.toFixed(1)}%)${noisy}`,
	);
}

function readVersion(): string {
	const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
	return pkg.version;
}

function readCommit(): string {
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
	try {
		return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
			encoding: "utf8",
		}).trim();
	} catch {
		return "unknown";
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
