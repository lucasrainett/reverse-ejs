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
├── run.ts              # orchestrator → writes results.json
├── compare.ts          # diff two results.json → markdown PR comment
└── results.json        # CI-only, gitignored locally
```

See `perf/README.md` for the schema, scenario design notes, and how to add
a new measurement.

### What gets measured

**Limit sweeps** (7 scenarios) scale a parameter until something throws.
The reported number is the largest N that succeeded. They map to the
ways a real template can blow up:

- Number of independent variables
- Loop body width (variables per iteration)
- Loop nesting depth
- Conditional alternation count
- Pure capture-group count (probes V8's named-capture cap)
- Rendered text size
- Include nesting depth

**Benchmarks** (5 scenarios) report median ms for stable workloads:

- Compile cost on a representative product-page template
- Full extraction on the same page
- `compileTemplate` reuse vs `reverseEjs` in a loop (validates the
  documented optimization)
- `flexibleWhitespace: true` overhead
- `types` coercion overhead

### Why this matters

The first run revealed a non-obvious finding: the V8 regex compiler
refuses to compile a reverse-ejs-shaped regex at **~3500–4000 captures**,
well below the documented 32767 named-group cap. That cliff is the same
regardless of whether the regex is dominated by capture groups, loop
bodies, alternations, or named groups, suggesting V8 hits a regex-tree
node-count limit, not a capture-name-table limit.

### Running

```bash
pnpm perf                   # everything → writes perf/results.json
pnpm perf:limits            # limits only (faster while iterating)
pnpm perf:bench             # benchmarks only
```

The output is a single `perf/results.json` with this shape (see
`perf/lib/types.ts` for the full TypeScript definition):

```jsonc
{
  "version": "3.0.1",
  "commit": "abc1234",
  "ranAt": "2026-04-16T...",
  "platform": { "node": "v22.11.0", "v8": "...", "os": "linux", ... },
  "limits":      { "regex-by-variable-count": { ... }, ... },
  "benchmarks":  { "extract-product-page":     { ... }, ... }
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

`perf/results.json` is in `.gitignore`. Local `pnpm perf` invocations
generate the file but git never sees it. CI bypasses the ignore with
`git add -f perf/results.json` and is the only authorized writer.
This guarantees the committed numbers always come from the same CI
environment, so diffs in the file are real performance changes, not
hardware variance.

Two more guards catch contributors who force-add the file on purpose
(`git add -f perf/results.json && git commit`):

1. **`.husky/pre-commit`** runs before any commit forms. If
   `perf/results.json` is staged, the hook prints a clear remediation
   message and exits 1, blocking the commit locally. This is the
   earliest catch — the bad commit never makes it into the developer's
   own history.

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
