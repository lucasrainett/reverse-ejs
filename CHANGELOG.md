# Changelog

All notable changes to `reverse-ejs` are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Typed return based on the `types` map.** The return type of
  `reverseEjs()`, `compileTemplate().match()`, and `reverseEjsAll()` now
  narrows per-key based on the supplied `types`. A call like
  `reverseEjs(t, r, { types: { age: "number" } })` returns an object
  typed `{ age: number; [key: string]: ExtractedValue }` — TypeScript
  knows `result.age` is a `number` without manual casts. Unknown keys
  fall back to the broad `ExtractedValue` union via the index signature.
- **Custom date parser.** `types` entries now accept an object spec
  `{ type: "date", parse: (s: string) => Date }` in addition to the
  `"date"` string shorthand. Use this for non-ISO formats, epoch
  seconds, locale-specific strings, etc. Backward compatible with the
  string shorthand.
- **`strict: true` option.** When set, `compileTemplate` and
  `reverseEjs` throw at compile time if the template would produce any
  raw-key fallback output — expression keys (`<%= title.toUpperCase() %>`
  → `"title.toUpperCase()"`), adjacent-variable joined keys
  (`<%= a %><%= b %>` → `"a + b"`), or complex-condition booleans
  (`<% if (a > b) { %>` → `"a > b": true`). For callers who want
  deterministic structured extraction and would rather fail loudly than
  see surprising keys.
- **Warning when conditions are nested inside loops.** Templates with
  `<% if (...) { %>` inside a `forEach` body silently drop the
  per-iteration condition from the output (a known gap in the current
  extractor). The library now emits a `console.warn` at compile time
  listing the affected conditions, so the gap surfaces before users
  investigate a missing key. Suppress with `silent: true`.
- **Property-based round-trip tests** (`tests/property.spec.ts`) via
  fast-check. Hammers the defining invariant
  `reverseEjs(t, ejs.render(t, d)) === d` with random data across the
  full feature matrix (single vars, three-field templates, dotted
  paths, loops of strings, loops of objects, numeric/boolean coercion,
  safe mode, fast-path / regex-path parity).
- **`tsconfig.test.json` + `pnpm typecheck` script.** `tsc --noEmit`
  over src + tests. The new typed-result test file (`tests/typed-
result.spec.ts`) carries explicit type annotations that would fail
  typecheck if the `types`-map narrowing ever regresses.
- **Dependabot config** (`.github/dependabot.yml`). Weekly devDeps
  updates, monthly GitHub Action bumps, grouped PRs to keep noise low.
- **Security considerations section** in the README. Documents the
  ReDoS surface (confined to the regex fallback path), the
  trust-boundary model (templates are author-controlled; rendered text
  can be external), and the recommended `safe: true` posture for
  untrusted input.
- **Compatibility & deprecation policy** in CONTRIBUTING.md. SemVer
  commitments for what counts as major / minor / patch.

### Fixed

- **Catastrophic backtracking on `<% if (x) { %>...<% } %>` inside a
  `forEach` body.** The generated regex was `^(?:(?:then)?)*$` — a
  textbook nested-quantifier shape that V8's engine explored
  exponentially, OOMing the process on trivial input. The loop case in
  `buildRegex` now unwraps a conditional-without-else body to its
  then-branch (`^(?:then)*$`), preserving semantics since the outer
  `*` already permits zero iterations.
- **Custom date parser now catches exceptions** instead of crashing the
  whole extraction. Documented behavior is "warn and fall back to
  string" when the parser produces an invalid Date; a parser that
  throws (e.g. on malformed input) now hits the same fallback with a
  warning that includes the parser's error message.
- **`strict: true` throws a plain `Error`** instead of `ReverseEjsError`.
  Template-author errors (missing partial, circular include, and now
  strict-mode rejection) are a different category from runtime match
  failures — the `Error` class convention matches the existing treatment
  and makes `catch (e) { if (e instanceof ReverseEjsError) ... }` blocks
  not log empty `details.regex` strings.
- **Fixed broken sentence in README "Security considerations" section**
  about `re2` / `unescape`.
- **Back-reference mismatch now names the actual inconsistent variable.**
  When a variable appeared twice in a template (or once in each of two
  partials) and the rendered text had different values at those positions,
  the error used to point at the next variable in pattern-tree walk order
  (e.g. `footerNote`) — always an innocent bystander. On mismatch, the
  extractor now re-runs a no-back-reference variant of the regex, compares
  the captured values per repeated name, and reports:
  `Variable "storeName" has inconsistent values in the rendered string —
"NewStore" vs "TechStore". Repeated variables (including the same
variable used across partial boundaries) must hold the same value
everywhere they appear.`
- **Fast-path regression on boundary-ambiguity templates.** The walker's
  `indexOf` takes the first occurrence of the next literal, while the
  regex path uses non-greedy captures with end-anchored backtracking and
  can push a capture past the first occurrence to let the rest of the
  pattern match. For templates where a captured value happens to contain
  the next literal (`<%= x %>a<%= y %>b` on `"abaab"` → `x=""`,
  `y="baa"`), the fast path rejected inputs the regex handled correctly.
  `compileTemplate` now falls back to the regex path when the walker
  returns null, preserving exact semantics while keeping the 10MB+ scale
  wins on the common cases.
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

- **Fast-path walker** — `compileTemplate()` now detects template shapes
  that don't need V8's regex engine and matches them with a cursor walk
  over the rendered string (`startsWith` for literals, `indexOf` for
  capture boundaries). Three tiers, each subsumed by the next:
    - _Pure literal_ (zero captures, zero loops, zero conditionals) —
      plain string comparison.
    - _Capture-only_ (literals + unique variables/expressions) — slice
      between literal anchors.
    - _Hybrid_ (literals + captures + loops/conditionals anchored by
      literals) — outer walk + tiny per-branch / per-loop-body regex.
      Result: templates that previously failed at ~40KB of literal text
      (V8's regex compiler cliff) now scale to **10MB+** for every mainstream
      shape. Loops and conditionals with outer literals fall out of the
      regex by construction — only the loop body / branch interior
      compiles, and those are typically <1KB.
- **Fallback to regex** is automatic and behavior-preserving for
  `flexibleWhitespace: true`, repeated capture names (back-reference
  semantics), inner/outer name collisions across opaque sections, and
  opaques without literal anchors (e.g. back-to-back loops). Users see
  the same output from either path.
- **Fast-path HTML unescape**: skips the entity-regex entirely when the
  extracted value contains no `&`. Measurable speedup for non-HTML
  batch workloads (logs, CSV, plain emails); no effect on HTML values
  that actually contain entities.
- **Benchmark deltas vs v3.0.1** (CI, Node 22 / V8 12.x, Mac local):
    - `extract-product-page`: 38.3μs → 7.6μs (**−80%**)
    - `extract-with-coercion`: 40.6μs → 8.3μs (**−80%**)
    - `extract-with-flexws`: 58.2μs → 18.1μs (−69%, regex path only)

### Perf infrastructure

- **Replaced misleading `reuse-vs-fresh-100x` benchmark** with three
  focused scenarios: `compile-cold` (cache miss), `match-only`
  (pre-compiled), `extract-product-page` (cache hit). The ratios between
  them are now computable directly from the committed numbers.
- **Realistic-corpus benchmarks**: `extract-log-lines` (100 log lines via
  `reverseEjsAll`), `extract-csv-rows` (1000-row CSV table),
  `extract-email` (long literals + sparse variables). Catches regressions
  in workloads the product-page synthetic bench misses.
- **Shape / scaling benchmarks** covering the walker dimensions:
  `large-page-hybrid` (30KB page with 5 scalars + 50-item loop),
  `batch-100-rows` (reverseEjsAll amortization),
  `deep-nested-extraction` (10-level dotted path → setNested cost),
  `backref-fallback` (regex-path penalty on a small template),
  `partial-expansion` (cache-warm include overhead).
- **Dedicated optimization regression bench**: `unescape-fast-path-vs-slow`
  exercises the two unescape paths side-by-side and reports the ratio.
  If a future refactor removes the fast path, the ratio collapses
  visibly.
- **Input-size limit sweeps** verifying the walker's new ceiling:
  `pure-literal-size` (up to 10MB, no regex involved),
  `literal-with-capture-size` (20MB template with a capture inside —
  hybrid walker), `literal-with-loop-size` (20MB template around a loop).
- **Output-shape and post-process limit sweeps**: `max-object-depth`
  (dotted-path depth), `max-loop-iterations` (array size extracted,
  scales to 1M items), `max-partial-breadth` (distinct partials in
  one template), `max-coercion-types` (scaling of `applyCoercions`).
- **Renamed limit sweeps** to reflect the post-walker reality —
  the `regex-by-*` prefix was stale for shapes the walker now handles
  without a regex at all:
    - `regex-by-variable-count` → `variable-count`
    - `regex-by-loop-body` → `loop-body-width`
    - `regex-by-loop-nesting` → `loop-nesting-depth`
    - `regex-by-conditionals` → `conditional-count`
    - `capture-group-cap` **removed** (duplicated `variable-count`
      once the fast path bypassed V8's named-group cap).
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

### Internal / refactor

- **Centralized helpers** — `escapeRegex` now lives only in
  `regexBuilder.ts` (previously duplicated in tokenizer.ts, normalize.ts,
  and the error-path regex-shape reconstruction); `isPlainObject` is a
  single helper used by every value-tree walk; `stripLocalsPrefix`
  replaces a hand-inlined string-slice that appeared twice in
  tokenizer.ts; `buildMismatchMessage` backs both the regex-path and
  walker-path mismatch errors so both keep identical shape.

### Tests

- **Expanded test coverage (+54 tests, 319 total)** across all 14 spec
  files, targeting combinations the prior suite missed:
    - Type coercion combined with loops, conditionals, expressions,
      and partials.
    - Unicode / emoji values across every path (capture-only, hybrid,
      regex fallback).
    - Very-long capture values (100KB in `variables.spec.ts`, 500KB
      in `api.spec.ts`).
    - Custom `unescape` honored by both fast and regex paths.
    - `reverseEjsAll` with coercion and without-safe failure.
    - Empty loops + coercion, numeric HTML entities, regex
      metacharacters in values.
    - Round-trip cases against real EJS for the new walker shapes
      (empty loops, single-item loops, raw tags, long literals).

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
