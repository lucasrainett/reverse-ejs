# Changelog

All notable changes to `reverse-ejs` are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Iterating the same array twice in a single template** now throws a clear
  `ReverseEjsError` at compile time instead of the previous cryptic "V8 regex
  engine refused to compile" error. The library emitted a duplicate-named
  capture group; the semantics of double-iteration are ambiguous (merge?
  separate arrays?) so refusing is the correct behavior.
- **Top-level arrays are no longer shadowed by nested suffix-matching loops.**
  Previously, extracting `items` from a template containing both
  `outer.items.forEach` and a top-level `items.forEach` returned empty for
  the top-level array. The internal loop lookup now prefers exact name
  matches before falling back to suffix matches.
- **Dotted-path `if` conditions now produce a boolean key in the output.**
  Templates like `<% if (user.isAdmin) { %>...<% } %>` previously dropped
  silently from the output; users saw no indication which branch matched.
  The condition text is now emitted as a key (`"user.isAdmin": true/false`),
  the same as any complex condition. Conditions inside loop bodies are still
  not captured (tracked for a future enhancement).
- **Variable names containing `__`** (double underscore) are now preserved
  correctly. The library's internal name encoding used `__` as a separator
  for dotted paths, causing `my__var` to be decoded as `my.var` (nested
  object). The encoding was removed — the original dotted names are stored
  directly in the name-context map.
- **Destructured parameters in `forEach`/`map`** (`items.forEach(({a, b}) =>
...)`) now throw a clear error at tokenize time instead of silently
  producing corrupted output. EJS supports them; reverse-ejs does not.
- **HTML entity `&#34;`** (numeric entity for `"`) is now correctly
  unescaped. EJS renders double-quotes as `&#34;`, not `&quot;`, so the
  round-trip previously failed for values containing quotes.
- **Library-emitted duplicate named groups** (a bug indicator, never a user
  error) now surface as an internal-error `ReverseEjsError` with a
  "please file an issue" message instead of being masked as "V8 refused".

### Added

- **Round-trip test suite** (`tests/round-trip.spec.ts`) using the actual
  `ejs` package. Renders with `ejs.render`, extracts with `reverseEjs`, and
  asserts the result equals the input data — catches divergences between
  the library's mental model of EJS and EJS's actual behavior.
- **Regression tests** for every bug fixed in this release, so they can't
  silently come back.
- **Differential test** comparing `reverseEjs()` and
  `compileTemplate().match()` on the same inputs — guarantees they stay
  equivalent.

### Changed

- The internal name-encoding scheme. Short names (`c0`, `c1`, ...) still
  flow into the regex; original dotted names now live in the `NameContext`
  map directly instead of going through a `toCaptureName`/`fromCaptureName`
  roundtrip. This removes the `__` collision risk and drops a small amount
  of code.

### Performance

- **Fast-path HTML unescape**: skips the regex scan entirely when the
  extracted value contains no `&`. Measurable speedup for non-HTML
  batch workloads (logs, CSV, plain emails); no effect on HTML values
  that actually contain entities.

### Perf infrastructure

- **Replaced misleading `reuse-vs-fresh-100x` benchmark** with three
  focused scenarios: `compile-cold` (cache miss), `match-only`
  (pre-compiled), `extract-product-page` (cache hit). The ratios between
  them are now computable directly from the committed numbers.
- **Realistic-corpus benchmarks**: `extract-log-lines` (100 log lines via
  `reverseEjsAll`), `extract-csv-rows` (1000-row CSV table),
  `extract-email` (long literals + sparse variables). Catches regressions
  in workloads the product-page synthetic bench misses.
- **Dedicated optimization regression bench**: `unescape-fast-path-vs-slow`
  exercises the two unescape paths side-by-side and reports the ratio.
  If a future refactor removes the fast path, the ratio collapses
  visibly.
- **Noise-aware PR comparison**: `perf/compare.ts` now flags changes
  smaller than the combined stddev as "≈ within noise" instead of
  reporting phantom deltas as regressions/improvements. Real regressions
  must exceed both 10% AND the measured noise floor.
- **Regex bytes column** in the limits table. The limit sweeps also
  report the regex source size at peak successful N, so optimizations
  that shrink the regex (e.g. capture-name shortening) are visible even
  when the coarse N cliff doesn't shift.
- **Git-ref support in `compare.ts`**: both arguments can now be file
  paths OR git refs. `pnpm perf:compare v3.0.0 HEAD` resolves each side
  via `git show <ref>:perf/results.json` and diffs any two points in
  history.
- **Sanity check in `runSweep`**: if the smallest sample size in a
  sweep fails, the perf run errors out hard instead of quietly reporting
  a meaningless limit. Protects against harness bugs or library
  regressions masquerading as "limit discovery."
- **Local-vs-CI output paths**: local runs write to
  `perf/results.local.json` (gitignored), CI writes to the committed
  `perf/results.json`. Local `pnpm perf` no longer dirties the tracked
  file.

## [3.0.2] — 2026-04-16

### Changed

- **Compile cache**: `reverseEjs()` and `compileTemplate()` now share an
  internal LRU (32 entries) keyed by template source + compile-affecting
  options. Repeat calls skip the tokenize + buildPattern + buildRegex
  pipeline, giving ~4× speedup for typical extract-from-page workloads
  without requiring users to adopt `compileTemplate` explicitly.
- **Smaller regexes**: capture groups are now emitted with short synthetic
  names (`c0`, `c1`, ...) instead of the original dotted names. Combined
  with swapping `[\s\S]*?` for `.*?` (the regex already runs with the `s`
  flag), regex source shrinks ~20-30% per capture on realistic templates.
  Headroom before V8's regex compiler cap is effectively doubled.
- **Conditional sentinel elimination**: when a conditional branch has at
  least one "witness" capture of its own, the zero-width sentinel group
  `(?<_C0TS>)` is no longer emitted — the witness signals the branch was
  taken. Literal-only branches still get sentinels.
- **Friendlier regex-too-large error**: V8's `SyntaxError: Invalid regular
expression` (which dumps the full regex source into the message) is now
  caught and rethrown as a `ReverseEjsError` with a remediation message
  pointing at partials.
- **Faster HTML unescape**: single-pass regex replacement instead of five
  sequential `.replace()` calls. Significant for large rendered values.

### Benchmark deltas (CI, Node 22.11 / V8 12.4, ubuntu-latest)

| Benchmark             |   3.0.1 |   3.0.2 |     Δ |
| --------------------- | ------: | ------: | ----: |
| compile-product-page  | 12.6 μs |  2.4 μs | −81 % |
| extract-product-page  | 38.3 μs | 22.7 μs | −41 % |
| extract-with-coercion | 40.6 μs | 23.8 μs | −41 % |
| extract-with-flexws   | 58.2 μs | 38.0 μs | −35 % |
| reuse-vs-fresh-100x   | 2.16 ms | 2.03 ms |  −6 % |

## [3.0.1] — earlier

Doc-only updates (README restructure, playground polish).

## [3.0.0]

### Changed

- **v3 capture model**: complex expressions (`<%= title.toUpperCase() %>`),
  adjacent variables (`<%= a %><%= b %>`), and complex conditions
  (`if (a > b)`) now produce keys in the output instead of being silently
  skipped or throwing. Breaking change from 2.x: templates containing these
  patterns now populate additional keys in the result object.

## Older

See the [git history](https://github.com/lucasrainett/reverse-ejs/commits/master)
for pre-3.0 changes. 2.0.x was a renaming from the initial `0.x` line.
