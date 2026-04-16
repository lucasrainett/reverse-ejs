// Realistic-corpus benchmark: 100 structured log lines via reverseEjsAll.
// This is the workload the README pitches for log parsing — the hot path
// is cached-compile + regex match per line, so it catches regressions in
// the compile-cache and in match performance for short inputs.

import { reverseEjsAll } from "../../src/index";
import { runBench } from "../lib/runner";
import type { BenchmarkResult } from "../lib/types";

export const id = "extract-log-lines";

const LOG_TEMPLATE =
	"[<%= level %>] <%= timestamp %> <%= service %>: <%= message %>";

const LEVELS = ["INFO", "WARN", "ERROR", "DEBUG"];
const SERVICES = ["api", "db", "auth", "cache", "scheduler"];

// 100 deterministic log lines with varied content so the same capture
// isn't hitting the same input repeatedly (which would over-favour V8's
// internal caches).
const LOG_LINES: string[] = Array.from({ length: 100 }, (_, i) => {
	const level = LEVELS[i % LEVELS.length];
	const svc = SERVICES[i % SERVICES.length];
	const sec = String(i % 60).padStart(2, "0");
	return `[${level}] 2026-04-16T10:${String(Math.floor(i / 60)).padStart(2, "0")}:${sec}Z ${svc}: event ${i} processed`;
});

export function run(): BenchmarkResult {
	return runBench({
		description:
			"reverseEjsAll() over 100 structured log lines — realistic log-parsing workload",
		fn: () => {
			reverseEjsAll(LOG_TEMPLATE, LOG_LINES);
		},
	});
}
