import { performance } from "node:perf_hooks";
import { compileTemplate } from "../../src/index";
import type { EjsOptions } from "../../src/types";
import type { BenchmarkResult, Limit, LimitScenario, Sample } from "./types";

// ── Sweep harness ───────────────────────────────────────────────

export interface SweepInput {
	template: string;
	rendered: string;
	options?: EjsOptions;
}

export interface SweepConfig {
	description: string;
	/** Sizes to probe, in increasing order. Sweep stops at the first failure. */
	sizes: number[];
	/** How many iterations per size. The reported value is the median. */
	iterations?: number;
	/** Build a (template, rendered) pair for the given N. */
	build: (n: number) => SweepInput;
}

export async function runSweep(cfg: SweepConfig): Promise<LimitScenario> {
	const iterations = cfg.iterations ?? 3;
	const samples: Sample[] = [];
	const startedAt = performance.now();
	let limit: Limit | null = null;
	let lastSuccessfulN: number | null = null;

	for (const n of cfg.sizes) {
		let stage: Limit["stage"] = "build";
		try {
			const compileTimes: number[] = [];
			const matchTimes: number[] = [];
			const extractTimes: number[] = [];
			let regexBytes = 0;

			for (let iter = 0; iter < iterations; iter++) {
				const { template, rendered, options } = cfg.build(n);

				stage = "compile";
				const t0 = performance.now();
				const compiled = compileTemplate(template, options);
				const t1 = performance.now();
				compileTimes.push(t1 - t0);

				if (iter === 0) {
					// Read the compiled regex once via a probe match — the
					// matcher's regex source isn't directly exposed.
					regexBytes = estimateRegexBytes(template, options);
				}

				stage = "match";
				const t2 = performance.now();
				const result = compiled.match(rendered);
				const t3 = performance.now();
				matchTimes.push(t3 - t2);
				if (result === null) {
					throw new Error("match returned null (no match)");
				}

				stage = "extract";
				// Extraction is included in compiled.match, but we record a
				// post-match traversal cost separately: serializing the result
				// to JSON exercises the whole tree.
				const t4 = performance.now();
				JSON.stringify(result);
				const t5 = performance.now();
				extractTimes.push(t5 - t4);
			}

			const compileMs = median(compileTimes);
			const matchMs = median(matchTimes);
			const extractMs = median(extractTimes);
			samples.push({
				n,
				regexBytes,
				compileMs,
				matchMs,
				extractMs,
				totalMs: compileMs + matchMs + extractMs,
			});
			lastSuccessfulN = n;
		} catch (err) {
			limit = {
				n,
				lastSuccessfulN,
				reason: errorString(err),
				stage,
			};
			break;
		}
	}

	return {
		description: cfg.description,
		samples,
		limit,
		durationMs: performance.now() - startedAt,
	};
}

// ── Benchmark harness ───────────────────────────────────────────

export interface BenchConfig {
	description: string;
	/** Number of measurement samples (default 100). */
	iterations?: number;
	/**
	 * Calls per sample — batching amortizes timer noise. Default auto-tunes
	 * to ~5 ms per sample so each sample is well above timer resolution.
	 */
	batchSize?: number;
	warmup?: number;
	fn: () => unknown;
}

export function runBench(cfg: BenchConfig): BenchmarkResult {
	const iterations = cfg.iterations ?? 100;
	const warmup = cfg.warmup ?? 20;

	for (let i = 0; i < warmup; i++) cfg.fn();

	// Auto-tune batchSize so each timed sample takes ~5 ms (well above timer
	// jitter). For ~20 μs ops this lands around batchSize=250.
	let batchSize = cfg.batchSize ?? 1;
	if (cfg.batchSize === undefined) {
		const probeStart = performance.now();
		cfg.fn();
		const probeMs = performance.now() - probeStart || 0.001;
		batchSize = Math.max(1, Math.round(5 / probeMs));
	}

	const samples: number[] = [];
	for (let i = 0; i < iterations; i++) {
		const t0 = performance.now();
		for (let j = 0; j < batchSize; j++) cfg.fn();
		const t1 = performance.now();
		samples.push((t1 - t0) / batchSize);
	}

	const sorted = [...samples].sort((a, b) => a - b);
	const med = sorted[Math.floor(iterations / 2)];
	const p99 = sorted[Math.min(iterations - 1, Math.floor(iterations * 0.99))];
	const mean = samples.reduce((s, x) => s + x, 0) / samples.length;
	const variance =
		samples.reduce((s, x) => s + (x - mean) ** 2, 0) / samples.length;
	const stddev = Math.sqrt(variance);

	return {
		description: cfg.description,
		samples: iterations,
		median_ms: med,
		p99_ms: p99,
		mean_ms: mean,
		stddev_ms: stddev,
		stddev_pct: med === 0 ? 0 : (stddev / med) * 100,
		ops_per_sec: med === 0 ? Infinity : 1000 / med,
		noisy: med > 0 && stddev / med > 0.15,
	};
}

// ── Helpers ─────────────────────────────────────────────────────

function median(arr: number[]): number {
	const sorted = [...arr].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];
}

function errorString(err: unknown): string {
	const raw =
		err instanceof Error ? `${err.name}: ${err.message}` : String(err);
	// Some errors (notably V8's regex SyntaxError) embed the entire regex
	// source in the message. Cap that so results.json stays readable.
	const MAX = 200;
	if (raw.length <= MAX) return raw;
	return raw.slice(0, MAX) + ` …[+${raw.length - MAX} chars]`;
}

/**
 * Estimate the byte size of the regex the library will build for `template`.
 * The matcher does not expose the underlying RegExp, so we re-do the same
 * tokenize → buildPattern → buildRegex pipeline locally and take .source.length.
 */
function estimateRegexBytes(template: string, options?: EjsOptions): number {
	// Lazy require keeps the benchmark surface clean from private library
	// modules. The eslint rule for require() is disabled for perf/.
	const { tokenize } = require("../../src/tokenizer");
	const { buildPattern } = require("../../src/patternBuilder");
	const { buildRegex, createNameContext } = require("../../src/regexBuilder");
	const tokens = tokenize(template, options);
	const pattern = buildPattern(tokens);
	const regexStr = buildRegex(
		pattern,
		undefined,
		new Set(),
		undefined,
		undefined,
		options?.flexibleWhitespace,
		createNameContext(),
	);
	return regexStr.length;
}
