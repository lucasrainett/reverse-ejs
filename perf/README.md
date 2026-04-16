# Performance suite

Probes how reverse-ejs scales and where its hard limits sit. Runs on every
push to `master` (commits results back) and on every PR (posts a comparison
comment). Standardized environment via pinned Node version on
`ubuntu-latest`.

## Layout

```
perf/
├── bench/              # benchmarks: stable workloads, statistical timings
│   ├── compile.ts      # compileTemplate() cost
│   ├── extract.ts      # full reverseEjs() round-trip on a typical page
│   ├── reuse.ts        # compileTemplate × N matches vs reverseEjs in a loop
│   ├── flexws.ts       # flexibleWhitespace overhead
│   └── coercion.ts     # types option overhead
├── limits/             # limit-finding sweeps: scale until failure
│   ├── regex-by-variable-count.ts
│   ├── regex-by-loop-body.ts
│   ├── regex-by-loop-nesting.ts
│   ├── regex-by-conditionals.ts
│   ├── capture-group-cap.ts
│   ├── rendered-size-sweep.ts
│   └── include-depth.ts
├── lib/                # shared timing harness, types
│   ├── runner.ts
│   └── types.ts
├── run.ts              # orchestrator → writes results.json
├── compare.ts          # diff two results.json → markdown PR comment
└── results.json        # canonical, committed file (history = perf history)
```

## Commands

| Command                                      | What                                      |
| -------------------------------------------- | ----------------------------------------- |
| `pnpm perf`                                  | Run everything, write `perf/results.json` |
| `pnpm perf:limits`                           | Limit sweeps only (faster iteration)      |
| `pnpm perf:bench`                            | Benchmarks only                           |
| `tsx perf/compare.ts before.json after.json` | Generate a markdown diff                  |

## Output

A single `perf/results.json` file with the schema in `lib/types.ts`. Each
commit on `master` gets one new version of this file — `git log perf/results.json`
is the perf history. Diffs in PRs surface regressions before merge via the
PR comment.

## Why two runners

- **Benchmarks** use a small in-process timer harness with batching (each
  sample runs N calls in a tight loop, so sample wall time stays well above
  timer resolution).
- **Limits** are one-shot sweeps that scale N until something throws. They
  don't fit a benchmark runner because the goal is to _find_ the failure,
  not amortize it.

Both write into the same `perf/results.json` under separate keys
(`limits.*`, `benchmarks.*`).

## Adding a scenario

1. Drop a new file in `perf/limits/` or `perf/bench/`.
2. Export `id` (string) and `run()` (returns `LimitScenario` or `BenchmarkResult`).
3. Add the dynamic import to `perf/run.ts`.

The orchestrator does the rest.

## CI behavior

- **Push to `master`**: runs the suite, commits the updated
  `perf/results.json` back with `[skip ci]` on the message (prevents loops).
- **Pull request**: runs the suite, diffs against master's `results.json`,
  posts/updates a sticky comment via `marocchino/sticky-pull-request-comment`.
  No commit.

Node version is pinned in `.github/workflows/perf.yml`. V8 changes between
Node versions affect the regex-engine limits directly — bump intentionally,
not by drift.
