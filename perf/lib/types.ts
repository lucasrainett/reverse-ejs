// Shared types for the performance suite. The orchestrator merges every
// scenario's output into a single `perf/results.json` keyed by scenario name.

export interface Sample {
	/** Scaling parameter (variable count, loop iterations, byte size, etc.). */
	n: number;
	/** Bytes of the generated regex source string. */
	regexBytes?: number;
	/** Time to tokenize + buildPattern + buildRegex (milliseconds). */
	compileMs?: number;
	/** Time to run regex.exec on the rendered string (milliseconds). */
	matchMs?: number;
	/** Time to walk the regex match groups and build the result object. */
	extractMs?: number;
	/** compileMs + matchMs + extractMs. */
	totalMs?: number;
	/** Free-text observation. */
	notes?: string;
}

export interface Limit {
	/** The first N at which the scenario failed. */
	n: number;
	/** The largest N that succeeded before the failure. */
	lastSuccessfulN: number | null;
	/** Error name + message, e.g. "SyntaxError: Invalid regular expression: ...". */
	reason: string;
	/** Where in the pipeline the error came from. */
	stage: "build" | "compile" | "match" | "extract";
}

export interface LimitScenario {
	description: string;
	samples: Sample[];
	limit: Limit | null;
	durationMs: number;
}

export interface BenchmarkResult {
	description: string;
	samples: number;
	median_ms: number;
	p99_ms: number;
	mean_ms: number;
	stddev_ms: number;
	stddev_pct: number;
	ops_per_sec: number;
	/** True when stddev/median > 15% — flag noisy measurements in PR comments. */
	noisy: boolean;
}

export interface Results {
	/** Library version under test. */
	version: string;
	/** Short SHA the run was generated from. */
	commit: string;
	/** ISO 8601 timestamp. */
	ranAt: string;
	platform: {
		node: string;
		v8: string;
		os: string;
		arch: string;
		runner: string;
	};
	limits: Record<string, LimitScenario>;
	benchmarks: Record<string, BenchmarkResult>;
}
