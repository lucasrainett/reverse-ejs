# Contributing to reverse-ejs

Thanks for your interest. This document describes the project's development
workflow, with particular attention to the **end-to-end tests** that verify
the docs playground and the **performance suite** that tracks limits and
benchmarks across commits.

## Quick start

```bash
pnpm install
pnpm build         # CJS + ESM + IIFE + TypeScript declarations
pnpm test          # vitest unit tests with coverage
pnpm lint          # eslint over src + docs + e2e + perf + playwright.config
```

## Test suites at a glance

| Suite           | Where                      | Runner               | Run with    |
| --------------- | -------------------------- | -------------------- | ----------- |
| **Unit**        | `tests/*.spec.ts`          | vitest 4             | `pnpm test` |
| **End-to-end**  | `e2e/*.spec.ts`            | Playwright           | `pnpm e2e`  |
| **Performance** | `perf/{bench,limits}/*.ts` | tsx (custom harness) | `pnpm perf` |

All three are gated in CI. Vitest excludes `e2e/**` so it doesn't try to run
Playwright specs as unit tests.

---

## End-to-end tests (Playwright)

Located in `e2e/playground.spec.ts`. **37 tests** covering every interactive
feature of the playground at <https://lucasrainett.github.io/reverse-ejs/>.

### What's covered

| Group                                                      | Tests |
| ---------------------------------------------------------- | ----- |
| Default load (silent HTML preload)                         | 1     |
| All 7 example buttons                                      | 7     |
| Format auto-detection (log / markdown / CSV)               | 3     |
| Options panel toggle + auto-open from URL                  | 2     |
| URL state sync (write + restore + full options round-trip) | 3     |
| Shareable example URLs (`?example=KEY`)                    | 2     |
| Auto-run debounced extraction                              | 2     |
| Reset                                                      | 1     |
| Copy button (clipboard + label flash + empty no-op)        | 2     |
| Ctrl+Enter shortcut                                        | 1     |
| Safe mode                                                  | 1     |
| Error path                                                 | 1     |
| Partials JSON validation + happy path                      | 2     |
| Type coercion (number + boolean)                           | 2     |
| v3 capture features (adjacent variables)                   | 1     |
| Loop extraction (typed array structure assertions)         | 1     |
| Highlight overlay spans (rendered / template / output)     | 3     |
| Custom delimiters (`?` + `[` `]`)                          | 2     |

### Architecture

- **Single selector pattern**: every test uses `page.getByTestId(...)` —
  no CSS classes, no `getByRole`, no IDs. The HTML carries 31
  `data-testid` attributes that map to the `TID` constant at the top of
  the spec file. Refactoring CSS classes or DOM structure does not break
  tests.
- **Library under test**: a `page.route()` interceptor catches the
  unpkg CDN request for `reverse-ejs@latest/dist/index.global.js` and
  fulfills it with the **freshly-built local `dist/index.global.js`**.
  Every test therefore exercises the in-repo code, not the published
  npm version.
- **Analytics capture**: a `page.addInitScript()` stubs
  `window.goatcounter` into a buffer accessible from tests. The real
  `gc.zgo.at/count.js` is blocked via `page.route(... abort)` so it
  cannot race the stub.
- **Static server**: Playwright launches `npx http-server docs -p 4173`
  as the `webServer.command`. `pnpm build` is part of the same command so
  `dist/index.global.js` is always current.

### Running

```bash
pnpm e2e                    # headless, parallel — what CI runs
pnpm e2e:headed             # visible browser, one test at a time, 300ms slow-mo
pnpm e2e:debug              # opens Playwright Inspector for step-through
pnpm e2e --grep "Copy"      # filter to matching tests
pnpm e2e e2e/playground.spec.ts:319   # single test by file:line
```

Set `PW_SLOW_MO=N` to override the slow-motion delay (milliseconds between
each Playwright action) for any of the above.

### Browser binary

`playwright.config.ts` autodetects a Chromium installation in this order:

1. `PLAYWRIGHT_CHROMIUM_PATH` env var
2. `/Applications/Chromium.app/Contents/MacOS/Chromium` on macOS
3. Whatever Playwright's bundled binary search finds (typically requires
   `pnpm exec playwright install chromium`)

The repo deliberately does not run `playwright install` automatically —
contributors who want UI mode should install Google Chrome at the standard
path (UI mode, separate from test execution, can only be hosted by Chrome,
Edge, or Playwright's bundled Chromium).

---

## Performance suite

Located in `perf/`. Probes how the library scales and where its hard
limits sit. Runs in CI on every push to master (commits results) and on
every PR (posts a comparison comment without committing).

### Layout

```
perf/
├── bench/                              # benchmarks: stable workloads, statistical timings
│   ├── compile.ts                      # compile-cold cost (cache miss)
│   ├── match-only.ts                   # match + extract on a pre-compiled template
│   ├── extract.ts                      # full reverseEjs() round-trip on a typical page
│   ├── flexws.ts                       # flexibleWhitespace overhead
│   ├── coercion.ts                     # types option overhead
│   ├── unescape-paths.ts               # fast-path vs slow-path unescape ratio
│   ├── log-lines.ts                    # 100 log lines via reverseEjsAll
│   ├── csv-rows.ts                     # 1000-row CSV
│   ├── email.ts                        # long literals + sparse variables
│   ├── large-page-hybrid.ts            # ~30KB page with 5 scalars + 50-item loop
│   ├── batch-100-rows.ts               # reverseEjsAll amortization
│   ├── deep-nested.ts                  # 10-level dotted path → setNested cost
│   ├── backref-fallback.ts             # forced regex-path penalty
│   ├── partial-expansion.ts            # cache-warm include cost
│   └── fixtures.ts                     # shared templates/rendered strings
├── limits/                             # limit-finding sweeps: scale until failure
│   ├── variable-count.ts               # N <%= varI %> tags (fast path)
│   ├── loop-body-width.ts              # wide loop body → regex cliff
│   ├── loop-nesting-depth.ts           # deeply nested forEach → stack cliff
│   ├── conditional-count.ts            # many if/else alternations → regex cliff
│   ├── rendered-size-sweep.ts          # variable value size (to ~1GB)
│   ├── pure-literal-size.ts            # template with zero captures
│   ├── literal-with-capture-size.ts    # literal mass around a single capture
│   ├── literal-with-loop-size.ts       # literal mass around a loop
│   ├── include-depth.ts                # linear partial recursion
│   ├── max-object-depth.ts             # dotted-path depth → setNested/stringify
│   ├── max-loop-iterations.ts          # array size extracted
│   ├── max-partial-breadth.ts          # distinct partials in one template
│   └── max-coercion-types.ts           # applyCoercions scaling
├── lib/                                # shared timing harness, types
├── run.ts                              # orchestrator → writes results.json
├── compare.ts                          # diff two results.json → markdown PR comment
└── results.json                        # CI-only, gitignored locally
```

See `perf/README.md` for the schema, scenario design notes, and how to add
a new measurement.

### What gets measured

**Limit sweeps** (13 scenarios) scale a parameter until something throws.
The reported number is the largest N that succeeded. They cover four
dimensions:

- **Shape stress** — variable count, loop body width, loop nesting depth,
  conditional count. Exercise the regex path (where still used) and the
  walker's pattern-tree recursion.
- **Input size** — pure-literal templates, literal-mass-around-capture,
  literal-mass-around-loop, rendered-value size. These benefit most from
  the fast-path walker; ceilings now sit in the multi-MB range.
- **Recursion / depth** — include nesting (hardcoded cap of 20).
- **Post-process** — object depth (setNested + downstream stringify),
  array size (extractLoopItems), partial breadth, coercion count.

**Benchmarks** (14 scenarios) report median ms for stable workloads:

- Isolated pipeline stages: `compile-cold`, `match-only`, `extract-product-page`
- Option overhead: `extract-with-flexws`, `extract-with-coercion`
- Optimization guards: `unescape-fast-path-vs-slow`
- Realistic corpora: `extract-log-lines`, `extract-csv-rows`, `extract-email`
- Scaling / shape: `large-page-hybrid`, `batch-100-rows`, `deep-nested-extraction`,
  `backref-fallback`, `partial-expansion`

### Why this matters

The limits used to cluster around **~3500–4000 captures** — V8's regex
compiler refusing the generated pattern well before its documented 32767
named-group cap. The current walker stack (pure-literal, capture-only,
hybrid) skips V8's regex entirely for the template shapes users actually
have, so the ceilings now sit much higher:

- Pure literal / capture-only / literal-around-loop: **multi-MB** inputs
  verified.
- Regex fallback (repeated captures, `flexibleWhitespace: true`,
  back-to-back opaques): still the old ~40KB cliff.

The sweeps track both regimes — when a PR changes shape-handling code,
the diff shows which regime moved.

### Running

```bash
pnpm perf                   # everything → writes perf/results.local.json
pnpm perf:limits            # limits only (faster while iterating)
pnpm perf:bench             # benchmarks only
```

Local runs write to `perf/results.local.json` (gitignored). CI writes to
`perf/results.json` (the tracked, canonical file). The two-path scheme
prevents a local run from dirtying the CI-owned tracked file — `.gitignore`
doesn't help there because the file is already tracked by git after CI's
first commit.

The output is a single `perf/results.json` with this shape (see
`perf/lib/types.ts` for the full TypeScript definition):

```jsonc
{
  "version": "3.0.2",
  "commit": "abc1234",
  "ranAt": "2026-04-17T...",
  "platform": { "node": "v22.11.0", "v8": "...", "os": "linux", ... },
  "limits":      { "variable-count": { ... }, "literal-with-loop-size": { ... }, ... },
  "benchmarks":  { "extract-product-page": { ... }, "large-page-hybrid": { ... }, ... }
}
```

### CI behavior

`.github/workflows/perf.yml`:

- **Push to master**: runs the suite, force-adds `perf/results.json` (it
  is `.gitignore`-d so local runs cannot accidentally commit it),
  commits with `[skip ci]` to avoid a loop, pushes back to master.
- **Pull request**: runs the suite, captures the master version of
  `perf/results.json` first, runs `tsx perf/compare.ts before.json
after.json` to generate a Markdown diff, posts it as a sticky PR
  comment via `marocchino/sticky-pull-request-comment`.

Node version is **pinned to `22.11.0`** in the workflow because V8
changes between Node versions affect regex-engine limits directly. Bump
deliberately, not by drift.

### Why local runs cannot pollute history

Three layers of protection, in order of where they catch:

1. **Different output paths**: the orchestrator (`perf/run.ts`) checks for
   `CI=true`. Local runs write to `perf/results.local.json` (gitignored).
   Only CI writes to the tracked `perf/results.json`. Local runs cannot
   dirty the canonical file at all.
2. **Pre-commit hook** (`.husky/pre-commit`): if `perf/results.json` ever
   does appear staged (e.g. via `git add -f`), the hook rejects the commit
   with a remediation message. Skipped on CI (`CI=true`) so the workflow's
   own legitimate auto-commit goes through.
3. **PR guard** (`.github/workflows/perf.yml`): on every PR, the workflow's
   first step checks for changes to `perf/results.json` in the diff. If a
   contributor bypassed the hook (`--no-verify`), the PR fails here with
   the same remediation message. Branch protection can gate merge on this
   check, making the block absolute.

Two more guards catch contributors who force-add the file on purpose
(`git add -f perf/results.json && git commit`):

1. **`.husky/pre-commit`** runs before any commit forms. If
   `perf/results.json` is staged, the hook prints a clear remediation
   message and exits 1, blocking the commit locally. This is the
   earliest catch — the bad commit never makes it into the developer's
   own history. The hook short-circuits when `CI=true` so the perf
   workflow's own auto-commit (the one legitimate writer of the file)
   isn't blocked by its own guard.

2. **`.github/workflows/perf.yml`** runs on every PR. Its first step is

    ```bash
    git diff --name-only origin/<base>...HEAD | grep -q '^perf/results\.json$'
    ```

    If the file appears in the PR diff (someone bypassed the local hook,
    e.g. with `--no-verify`), the workflow **fails the PR** with the same
    remediation message. Branch protection rules can require this check
    so the PR cannot be merged until the file is restored.

Three layers total: gitignore prevents accidents, the pre-commit hook
catches force-adds locally, and the PR guard catches anyone who skipped
the hook.

---

## Lint, typecheck, and the build

```bash
pnpm lint              # eslint src docs e2e perf playwright.config.ts
pnpm format            # prettier --write everywhere
npx tsc --noEmit       # typecheck (uses tsconfig.json which only includes src/)
pnpm build             # tsup → dist/{index.js, index.mjs, index.global.js, index.d.ts, index.d.mts}
```

The `lint-staged` pre-commit hook runs `eslint --fix` + `prettier --write`
on staged files. The lint script intentionally matches what `lint-staged`
checks so local `pnpm lint` and pre-commit produce the same set of errors.

## Node versions across workflows

Different workflows pin Node differently on purpose:

| Workflow                      | Node                  | Why                                                                                                         |
| ----------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `package.json` `engines.node` | `>=20`                | Minimum the library actually supports                                                                       |
| `ci.yml`                      | matrix `[20, 22, 24]` | Verify the library works on every supported version                                                         |
| `perf.yml`                    | pinned `22.11.0`      | V8 changes between Node versions affect regex-engine limits directly — reproducibility for the perf history |
| `publish.yml`                 | pinned `24`           | npm trusted publishing requires npm v11.5.1+ which ships with Node 24                                       |

When bumping any pin, do it deliberately and update this table.

## Release process

Tagged via the publish workflow on push to master — see
`.github/workflows/publish.yml`. Bumping `package.json` version triggers
a publish; if the version already has a tag and `src/` has changed, the
workflow auto-bumps a patch.

Reach out via [GitHub issues](https://github.com/lucasrainett/reverse-ejs)
with anything that's unclear.
