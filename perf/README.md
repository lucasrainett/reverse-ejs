# Performance suite

Probes how reverse-ejs scales and where its hard limits sit. Runs on every
push to `master` (commits results back) and on every PR (posts a comparison
comment). Standardized environment via pinned Node version on
`ubuntu-latest`.

## Layout

```
perf/
├── bench/              # benchmarks: stable workloads, statistical timings
│   ├── compile.ts                   # compile-cold cost
│   ├── match-only.ts                # pre-compiled match + extract
│   ├── extract.ts                   # full reverseEjs() on a product page
│   ├── flexws.ts                    # flexibleWhitespace overhead
│   ├── coercion.ts                  # types option overhead
│   ├── unescape-paths.ts            # fast vs slow unescape ratio
│   ├── log-lines.ts                 # 100 log lines
│   ├── csv-rows.ts                  # 1000-row CSV
│   ├── email.ts                     # long-literal email template
│   ├── large-page-hybrid.ts         # ~30KB page, hybrid walker
│   ├── batch-100-rows.ts            # reverseEjsAll amortization
│   ├── deep-nested.ts               # 10-level dotted path
│   ├── backref-fallback.ts          # forced regex-path
│   ├── partial-expansion.ts         # cache-warm include overhead
│   └── fixtures.ts                  # shared templates
├── limits/             # limit-finding sweeps: scale until failure
│   ├── variable-count.ts            # N <%= varI %> tags
│   ├── loop-body-width.ts           # wide loop body (regex cliff)
│   ├── loop-nesting-depth.ts        # deeply nested forEach (stack cliff)
│   ├── conditional-count.ts         # many alternations (regex cliff)
│   ├── rendered-size-sweep.ts       # variable value size
│   ├── pure-literal-size.ts         # zero-capture template
│   ├── literal-with-capture-size.ts # literal around one capture
│   ├── literal-with-loop-size.ts    # literal around one loop
│   ├── include-depth.ts             # linear partial recursion
│   ├── max-object-depth.ts          # dotted-path depth
│   ├── max-loop-iterations.ts       # array size
│   ├── max-partial-breadth.ts       # distinct partials
│   └── max-coercion-types.ts        # types entries
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
