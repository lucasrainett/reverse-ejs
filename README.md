# reverse-ejs

[![npm](https://img.shields.io/npm/v/reverse-ejs)](https://www.npmjs.com/package/reverse-ejs)
[![downloads](https://img.shields.io/npm/dw/reverse-ejs)](https://www.npmjs.com/package/reverse-ejs)
[![bundle size](https://img.shields.io/bundlephobia/minzip/reverse-ejs)](https://bundlephobia.com/package/reverse-ejs)
[![ci](https://img.shields.io/github/actions/workflow/status/lucasrainett/reverse-ejs/ci.yml?branch=master&label=ci)](https://github.com/lucasrainett/reverse-ejs/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/reverse-ejs)](https://github.com/lucasrainett/reverse-ejs/blob/master/LICENSE)

The inverse of `ejs.render()`. Given an EJS template and the rendered output it produced, extract the data object that was used to render it.

Works with **any text format**: HTML, Markdown, plain text, log lines, emails, CSV rows, config files - anything you can describe with an EJS template. Most tools in this space only handle HTML; reverse-ejs just sees text, so the same library parses a product page, a shipping confirmation email, and a structured log line with the same API.

```ts
import { reverseEjs } from "reverse-ejs";

reverseEjs("Hello, <%= name %>!", "Hello, Alice!");
// => { name: "Alice" }
```

> **Read the article:** [What if you could reverse a template engine?](https://dev.to/lucasrainett/what-if-you-could-reverse-a-template-engine-5nk)

**[Try it in the browser](https://lucasrainett.github.io/reverse-ejs/)**

## When to reach for this

| Tool              | Good at                                                                                                                                     | Not so good at                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **reverse-ejs**   | Structured text with a known shape (product pages, email templates, logs, CSV rows, Markdown, CLI output); same template across many inputs | Pages where the structure varies between inputs         |
| Cheerio / JSDOM   | HTML scraping when the structure changes between pages                                                                                      | Non-HTML formats; large bundle overhead for simple jobs |
| node-html-parser  | Fast HTML-only DOM traversal                                                                                                                | Non-HTML formats; relational extraction across elements |
| LLM extraction    | One-off extraction from truly unstructured text                                                                                             | Throughput, cost, determinism, offline use              |
| Hand-rolled regex | Raw speed on a single well-understood shape                                                                                                 | Readability, maintenance as the shape evolves           |

If your source text has a stable shape (emitted by a template, a logger, a CLI tool) and you want the data back: this is the tool. If you're scraping sites where every page looks different, Cheerio is a better fit.

## Installation

```bash
npm install reverse-ejs
# or
pnpm add reverse-ejs
# or
yarn add reverse-ejs
```

Works in Node.js, browsers, and any JavaScript runtime. Ships as ESM, CommonJS, and IIFE.

## Usage

### Basic extraction

```ts
import { reverseEjs } from "reverse-ejs";

const template = "<h1><%= title %></h1><p><%= description %></p>";
const rendered = "<h1>My Page</h1><p>Welcome to the site</p>";

reverseEjs(template, rendered);
// => { title: "My Page", description: "Welcome to the site" }
```

### Nested properties

```ts
const template = '<a href="<%= author.url %>"><%= author.name %></a>';
const rendered = '<a href="https://example.com">Alice Chen</a>';

reverseEjs(template, rendered);
// => { author: { url: "https://example.com", name: "Alice Chen" } }
```

### Loops

Supports `forEach`, `map`, `for...of`, `for...in`, classic `for`, `while`, and chained `.filter().forEach()`:

```ts
const template = "<% users.forEach(user => { %><li><%= user.name %> (<%= user.role %>)</li><% }) %>";
const rendered = "<li>Alice (admin)</li><li>Bob (viewer)</li>";

reverseEjs(template, rendered);
// => { users: [{ name: "Alice", role: "admin" }, { name: "Bob", role: "viewer" }] }
```

Nested loops work too:

```ts
const template = "<% departments.forEach(dept => { %>" + "<h2><%= dept.name %></h2>" + "<% dept.members.forEach(m => { %><li><%= m.name %></li><% }) %>" + "<% }) %>";

const rendered = "<h2>Engineering</h2><li>Alice</li><li>Bob</li><h2>Design</h2><li>Carol</li>";

reverseEjs(template, rendered);
// => {
//   departments: [
//     { name: "Engineering", members: [{ name: "Alice" }, { name: "Bob" }] },
//     { name: "Design", members: [{ name: "Carol" }] },
//   ]
// }
```

### Conditionals

Extracts the matching branch and infers boolean conditions:

```ts
const template = "<% if (isPremium) { %>" + "<p>Welcome, premium user <%= name %>!</p>" + "<% } else { %>" + "<p>Welcome, <%= name %>!</p>" + "<% } %>";

reverseEjs(template, "<p>Welcome, premium user Alice!</p>");
// => { isPremium: true, name: "Alice" }

reverseEjs(template, "<p>Welcome, Bob!</p>");
// => { isPremium: false, name: "Bob" }
```

`else if` chains and `switch/case` are also supported.

### HTML entity unescaping

Values extracted from `<%= %>` tags are automatically unescaped:

```ts
reverseEjs("<p><%= content %></p>", "<p>AT&amp;T &quot;wireless&quot;</p>");
// => { content: 'AT&T "wireless"' }
```

Values from raw `<%- %>` tags are returned as-is, without unescaping.

### Includes / partials

Pass partial templates via the `partials` option:

```ts
const partials = {
	header: "<h1><%= title %></h1>",
	footer: "<footer><%= copyright %></footer>",
};

const template = '<%- include("header") %><main><%= body %></main><%- include("footer") %>';
const rendered = "<h1>Home</h1><main>Welcome</main><footer>2025 Acme</footer>";

reverseEjs(template, rendered, { partials });
// => { title: "Home", body: "Welcome", copyright: "2025 Acme" }
```

Nested includes, shared variables across partials, and includes inside loops are supported. The [interactive playground](https://lucasrainett.github.io/reverse-ejs/?example=store) has a "Store (partials)" example with a header + footer partial driving a full storefront extraction.

### Repeated variables

When the same variable appears multiple times, the library enforces that all occurrences have the same value:

```ts
reverseEjs("<title><%= name %></title><h1><%= name %></h1>", "<title>Alice</title><h1>Alice</h1>");
// => { name: "Alice" }
```

### JavaScript expressions

Tags containing arbitrary JavaScript (method calls, arithmetic, ternaries, template literals, etc.) are captured under their raw expression text as the key:

```ts
reverseEjs("<h1><%= title.toUpperCase() %></h1>", "<h1>HELLO</h1>");
// => { "title.toUpperCase()": "HELLO" }

reverseEjs("<td><%= price * qty %></td>", "<td>30</td>");
// => { "price * qty": "30" }

reverseEjs('<p><%= active ? "Online" : "Offline" %></p>', "<p>Online</p>");
// => { 'active ? "Online" : "Offline"': "Online" }
```

Whitespace inside the expression is normalized so `<%= price*qty %>` and `<%= price * qty %>` produce the same key. Inside a loop body the loop item prefix is stripped, so `<%= item.price * item.qty %>` becomes `"price * qty"` on each item.

### Adjacent variables

Two or more variables with no literal text between them are captured under a single joined key:

```ts
reverseEjs("<%= firstName %><%= lastName %>", "AliceSmith");
// => { "firstName + lastName": "AliceSmith" }
```

The individual values are not separable (the split point is ambiguous), so the library returns them as one combined value.

### Complex conditions

Conditions beyond a bare identifier (comparisons, logical operators, method calls) are captured as booleans under their raw text as the key:

```ts
const template = "<% if (items.length > 0) { %><ul>...</ul><% } %>";
reverseEjs(template, "<ul>...</ul>");
// => { "items.length > 0": true }

reverseEjs(template, "");
// => { "items.length > 0": false }
```

Bare-identifier conditions (`if (isAdmin)`) keep producing a clean `{ isAdmin: true }` key as before.

## Compiled templates

When processing many rendered strings against the same template, compile it once for better performance:

```ts
import { compileTemplate } from "reverse-ejs";

const compiled = compileTemplate("<%= name %> is <%= age %> years old.");

compiled.match("Alice is 30 years old."); // { name: "Alice", age: "30" }
compiled.match("Bob is 25 years old."); // { name: "Bob", age: "25" }
```

Since v3.0.2, `reverseEjs()` also uses an internal compile cache, so calling it in a loop on the same template gets most of the speedup automatically. Explicit `compileTemplate` is still faster for very-hot paths and guarantees no cache eviction. The speedup is template-size-dependent: ~1.5x on larger templates, 4-6x on smaller ones.

## Batch extraction

For arrays of rendered strings, use `reverseEjsAll` to compile once and process all:

```ts
import { reverseEjsAll } from "reverse-ejs";

const rows = reverseEjsAll("<tr><td><%= name %></td><td><%= score %></td></tr>", ["<tr><td>Alice</td><td>95</td></tr>", "<tr><td>Bob</td><td>87</td></tr>"], { types: { score: "number" } });
// => [{ name: "Alice", score: 95 }, { name: "Bob", score: 87 }]
```

## Type coercion

By default all extracted values come back as strings. Use the `types` option to coerce them:

```ts
reverseEjs("Age: <%= age %>, Active: <%= active %>", "Age: 30, Active: true", { types: { age: "number", active: "boolean" } });
// => { age: 30, active: true }
```

Supported types: `"string"` (default), `"number"`, `"boolean"`, `"date"`. Failed coercions log a warning and keep the original string. Suppress with `silent: true`.

### Custom date parser

The `"date"` shorthand uses `new Date(value)`, which is brittle for anything that isn't ISO 8601. Pass the object form with a `parse` function to handle non-ISO formats, epoch seconds, locale strings, etc:

```ts
reverseEjs("Shipped: <%= at %>", "Shipped: 1700000000", {
	types: {
		at: {
			type: "date",
			parse: (s) => new Date(Number(s) * 1000), // epoch seconds
		},
	},
});
// => { at: Date(2023-11-14...) }
```

If your parser returns an Invalid `Date`, the library warns and keeps the raw string (same fallback as the shorthand form).

### Strict mode

Set `strict: true` to reject templates that would produce any "raw-key fallback" output — expression keys, adjacent-variable joined keys, or complex-condition booleans. Useful when you want deterministic, structured extraction and would rather fail loudly than see surprising keys in your result object:

```ts
reverseEjs("<h1><%= title.toUpperCase() %></h1>", "<h1>HELLO</h1>", {
	strict: true,
});
// throws ReverseEjsError: strict mode: template contains raw-key fallbacks...
```

Plain variables, dotted paths, loops, and bare-identifier conditions still work; only the fallback-shape outputs are rejected.

### Typed result narrowing

When you supply a `types` map with a known literal shape, TypeScript narrows the return type per key:

```ts
const result = reverseEjs("Age: <%= age %>, Admin: <%= admin %>", input, {
	types: { age: "number", admin: "boolean" },
});
// result.age: number
// result.admin: boolean
// result[otherKey]: ExtractedValue (falls back via index signature)
```

No manual casts needed. Works for the string shorthand and the custom-date-parser object form.

## Safe mode

By default, a match failure throws. Use `safe: true` to get `null` instead:

```ts
const result = reverseEjs(template, html, { safe: true });
if (result === null) {
	console.warn("HTML did not match template");
}
```

## Options

```ts
interface ReverseEjsOptions {
	/** Override the tag delimiter character (default "%"). */
	delimiter?: string;
	/** Override the opening delimiter character (default "<"). */
	openDelimiter?: string;
	/** Override the closing delimiter character (default ">"). */
	closeDelimiter?: string;
	/** Strip leading/trailing whitespace from template lines before matching. */
	rmWhitespace?: boolean;
	/** Ignore whitespace differences between template and rendered HTML. */
	flexibleWhitespace?: boolean;
	/** Custom HTML-unescape function for extracted values. */
	unescape?: (s: string) => string;
	/** Map of partial name to EJS source for include expansion. */
	partials?: Record<string, string>;
	/** Return null instead of throwing on match failure. */
	safe?: boolean;
	/** Suppress console warnings (coercion failures, nested-condition-in-loop). */
	silent?: boolean;
	/** Throw at compile time on raw-key fallbacks (expressions / joined / complex conditions). */
	strict?: boolean;
	/** Map of variable name to coercion spec. */
	types?: Record<string, "string" | "number" | "boolean" | "date" | { type: "date"; parse: (s: string) => Date }>;
}
```

| Option               | Type     | Default      | Description                                              |
| -------------------- | -------- | ------------ | -------------------------------------------------------- |
| `delimiter`          | string   | `"%"`        | Inner delimiter character                                |
| `openDelimiter`      | string   | `"<"`        | Opening delimiter character                              |
| `closeDelimiter`     | string   | `">"`        | Closing delimiter character                              |
| `rmWhitespace`       | boolean  | `false`      | Strip line whitespace before matching                    |
| `flexibleWhitespace` | boolean  | `false`      | Ignore whitespace differences                            |
| `unescape`           | function | XML unescape | Custom HTML-unescape function                            |
| `partials`           | object   | `{}`         | Map of partial names to EJS source                       |
| `safe`               | boolean  | `false`      | Return `null` instead of throwing                        |
| `silent`             | boolean  | `false`      | Suppress coercion + nested-condition warnings            |
| `strict`             | boolean  | `false`      | Throw on expression / joined-key / complex-condition use |
| `types`              | object   | `{}`         | Coercion map — string shorthand or `{type, parse}` spec  |

### Custom delimiters

```ts
reverseEjs("<?= name ?>", "Alice", { delimiter: "?" });
// => { name: "Alice" }

reverseEjs("[%= name %]", "Alice", { openDelimiter: "[", closeDelimiter: "]" });
// => { name: "Alice" }
```

### Custom unescape

```ts
const unescape = (s: string) => s.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

reverseEjs("<p><%= val %></p>", "<p>&#60;b&#62;bold&#60;/b&#62;</p>", { unescape });
// => { val: "<b>bold</b>" }
```

### Flexible whitespace

When extracting data from web pages, the HTML formatting often differs from your template. Enable `flexibleWhitespace` to ignore whitespace differences:

```ts
const template = `<div>
  <h1><%= title %></h1>
  <p><%= body %></p>
</div>`;

// Works with minified HTML
reverseEjs(template, "<div><h1>Hello</h1><p>World</p></div>", { flexibleWhitespace: true });
// => { title: "Hello", body: "World" }

// Works with differently indented HTML
reverseEjs(template, "<div>\n\t<h1>Hello</h1>\n\t<p>World</p>\n</div>", { flexibleWhitespace: true });
// => { title: "Hello", body: "World" }
```

Recommended for web data extraction where you don't control the source formatting.

## EJS Feature Support

| Feature                                           | Status                             |
| ------------------------------------------------- | ---------------------------------- |
| `<%= var %>` escaped output                       | Supported                          |
| `<%- var %>` raw output                           | Supported                          |
| `<%# comment %>`                                  | Supported (ignored)                |
| `<%%` / `%%>` literal delimiters                  | Supported                          |
| `-%>` newline slurp                               | Supported                          |
| `<%_` / `_%>` whitespace slurp                    | Supported                          |
| `forEach` / `map` (arrow + function syntax)       | Supported                          |
| `for...of` / `for...in` / classic `for` / `while` | Supported                          |
| `.filter().forEach()` chained                     | Supported                          |
| Nested loops (any depth)                          | Supported                          |
| `if` / `if...else` / `else if` chains             | Supported                          |
| `switch` / `case` / `default`                     | Supported                          |
| `<%- include("file") %>` partials                 | Supported                          |
| Nested includes                                   | Supported                          |
| `locals.varName` prefix stripping                 | Supported                          |
| Repeated variables (backreference)                | Supported                          |
| Custom delimiters                                 | Supported                          |
| `rmWhitespace` option                             | Supported                          |
| Custom `unescape` function                        | Supported                          |
| JS expressions (ternary, method calls)            | Captured under raw expression key  |
| Adjacent variables with no separator              | Captured as joined `"a + b"` key   |
| Complex conditions (`a > b`, `role === "x"`)      | Captured as boolean under raw key  |
| Dynamic `include(varName)`                        | Throws descriptive error           |
| Type coercion (number / boolean / date)           | Via `types` option                 |
| Compiled templates (`compileTemplate`)            | For repeated extractions           |
| Batch extraction (`reverseEjsAll`)                | Multiple inputs, one template      |
| Safe mode (`safe: true`)                          | Returns `null` instead of throwing |

## Web Data Extraction

You can use reverse-ejs to extract structured data from any web page by turning its HTML into an EJS template.

### Step by step

1. **Save the HTML** - view source or save the page you want to extract data from
2. **Create a template** - copy the HTML into an `.ejs` file
3. **Replace values with EJS tags** - swap the data you want to extract with `<%= variable %>` placeholders
4. **Run reverse-ejs** - pass the original HTML and your template to get the data back

### Example: extracting product data

Say you have a product page with this HTML:

```html
<div class="product">
	<h1>Sony WH-1000XM5</h1>
	<span class="price">$348.00</span>
	<p class="description">Industry-leading noise canceling headphones</p>
	<div class="specs">
		<span class="brand">Sony</span>
		<span class="color">Black</span>
		<span class="rating">4.7</span>
	</div>
	<ul class="reviews">
		<li>
			<strong>Alice</strong>
			<span>Best headphones I've ever owned. The noise canceling is incredible.</span>
		</li>
		<li>
			<strong>Bob</strong>
			<span>Great sound quality, comfortable for long flights.</span>
		</li>
	</ul>
</div>
```

Create a template by replacing the data with EJS tags:

```ejs
<div class="product">
  <h1><%= name %></h1>
  <span class="price">$<%= price %></span>
  <p class="description"><%= description %></p>
  <div class="specs">
    <span class="brand"><%= specs.brand %></span>
    <span class="color"><%= specs.color %></span>
    <span class="rating"><%= specs.rating %></span>
  </div>
  <ul class="reviews">
    <% reviews.forEach(review => { %>
    <li>
      <strong><%= review.author %></strong>
      <span><%= review.text %></span>
    </li>
    <% }) %>
  </ul>
</div>
```

Run reverse-ejs:

```ts
import { reverseEjs } from "reverse-ejs";
import { readFileSync } from "fs";

const html = readFileSync("page.html", "utf-8");
const template = readFileSync("template.ejs", "utf-8");

const data = reverseEjs(template, html);
console.log(data);
```

Output:

```json
{
	"name": "Sony WH-1000XM5",
	"price": "348.00",
	"description": "Industry-leading noise canceling headphones",
	"specs": {
		"brand": "Sony",
		"color": "Black",
		"rating": "4.7"
	},
	"reviews": [
		{
			"author": "Alice",
			"text": "Best headphones I've ever owned. The noise canceling is incredible."
		},
		{
			"author": "Bob",
			"text": "Great sound quality, comfortable for long flights."
		}
	]
}
```

One template works for every product page with the same HTML structure. When the page updates with new data, run it again - same template, fresh data.

## Beyond HTML

HTML is the obvious use case, but reverse-ejs never assumes its input is HTML. It just matches text against a template, so you can point it at Markdown, logs, emails, CSV rows, CLI output, or any other templated text. Most HTML-specific scraping tools stop at the DOM; reverse-ejs keeps going.

### Markdown

Extract post frontmatter and body structure from Markdown documents:

```ts
const template = `# <%= title %>

**Author:** <%= author %>
**Published:** <%= date %>

<%= summary %>

## Tags

<% tags.forEach(tag => { %>- <%= tag %>
<% }) %>`;

const rendered = `# My First Post

**Author:** Alice Chen
**Published:** 2026-04-10

A short post about reverse-ejs.

## Tags

- javascript
- typescript
- parsing
`;

reverseEjs(template, rendered);
// => {
//   title: "My First Post",
//   author: "Alice Chen",
//   date: "2026-04-10",
//   summary: "A short post about reverse-ejs.",
//   tags: ["javascript", "typescript", "parsing"],
// }
```

### Structured log lines

Turn application logs into queryable objects:

```ts
const template = "[<%= level %>] <%= timestamp %> <%= service %>: <%= message %>";
const rendered = "[ERROR] 2026-04-10T17:00:00Z api-gateway: upstream connection refused";

reverseEjs(template, rendered);
// => {
//   level: "ERROR",
//   timestamp: "2026-04-10T17:00:00Z",
//   service: "api-gateway",
//   message: "upstream connection refused",
// }
```

Combine with `reverseEjsAll` to process a whole log file line-by-line, or with `safe: true` to skip lines that don't match.

### Transactional emails

Pull order details out of the plain-text body of a confirmation email:

```ts
const template = `Hi <%= customer %>,

Your order <%= orderId %> has shipped!

<% items.forEach(item => { %>  - <%= item.qty %>x <%= item.name %> ($<%= item.price %>)
<% }) %>
Total: $<%= total %>

Tracking: <%= trackingUrl %>
`;

const email = `Hi Alice,

Your order #A-1234 has shipped!

  - 2x Widget ($9.99)
  - 1x Gadget ($24.50)

Total: $44.48

Tracking: https://ship.example.com/track/ZZ1234
`;

reverseEjs(template, email, {
	types: { qty: "number", price: "number", total: "number" },
});
// => {
//   customer: "Alice",
//   orderId: "#A-1234",
//   items: [
//     { qty: 2, name: "Widget", price: 9.99 },
//     { qty: 1, name: "Gadget", price: 24.50 },
//   ],
//   total: 44.48,
//   trackingUrl: "https://ship.example.com/track/ZZ1234",
// }
```

### CSV-like or delimited rows

Parse fixed-shape delimited data without bringing in a CSV library:

```ts
const template = "<% rows.forEach(r => { %><%= r.name %>,<%= r.score %>\n<% }) %>";
const rendered = "Alice,95\nBob,87\nCarol,72\n";

reverseEjs(template, rendered, { types: { score: "number" } });
// => {
//   rows: [
//     { name: "Alice", score: 95 },
//     { name: "Bob", score: 87 },
//     { name: "Carol", score: 72 },
//   ],
// }
```

### CLI output

Parse the output of `git`, `npm`, or any other tool with a stable text format. Here's `git log --oneline`:

```ts
const template = "<% commits.forEach(c => { %><%= c.hash %> <%= c.message %>\n<% }) %>";
const rendered = "abc1234 Fix authentication bug\n" + "def5678 Add CSV export feature\n" + "9012345 Bump dependencies\n";

reverseEjs(template, rendered);
// => {
//   commits: [
//     { hash: "abc1234", message: "Fix authentication bug" },
//     { hash: "def5678", message: "Add CSV export feature" },
//     { hash: "9012345", message: "Bump dependencies" },
//   ],
// }
```

Avoid padded/aligned formats like `docker ps` or `ls -l` - the varying whitespace between columns isn't something an EJS template can describe. Prefer formats with consistent delimiters (single space, comma, pipe, tab).

### Tips for non-HTML sources

- HTML entity unescaping (`&amp;` → `&`, etc.) still runs by default. If your source is plain text or Markdown, pass `unescape: (s) => s` to disable it.
- `flexibleWhitespace: true` is tuned for HTML (collapses whitespace around `<` and `>`). For non-HTML formats where whitespace is significant (logs, CSV), leave it off.
- For log-file or email processing over many inputs, use `compileTemplate()` once and reuse the matcher.

## How It Works

1. **Tokenize** — Split the template using EJS's own delimiter logic.
2. **Build pattern** — Convert tokens into an AST (literals, variables, expressions, loops, conditionals).
3. **Match** — Pick the cheapest strategy for the pattern's shape:
    - **Pure literal** (zero captures) → plain string equality.
    - **Capture-only** (literals + variables/expressions) → cursor walk with `startsWith` / `indexOf`. No regex.
    - **Hybrid** (captures plus loops/conditionals anchored by literals) → outer cursor walk; small per-body regex scoped to the loop/conditional's sliced sub-section.
    - **Regex fallback** for everything else (`flexibleWhitespace`, repeated captures that need back-references, back-to-back loops with no anchor between them). A named-capture-group regex built from the AST.
4. **Extract** — Map captures back to variable names and apply `types` coercion.

The walker tiers skip V8's regex compiler entirely for the shapes most templates have, so large templates (up to ~10MB for mainstream shapes) work out of the box. The regex fallback preserves exact semantics for the cases the walker can't handle, so behavior is identical either way.

### Scale guidance

| Template shape                                  | Practical ceiling |
| ----------------------------------------------- | ----------------- |
| Pure literal (no EJS tags yet)                  | ~1GB              |
| Literals + variables / expressions              | ~10MB             |
| Literals + loops / conditionals around literals | ~10MB             |
| Same variable captured twice (regex path)       | ~40KB of literals |
| `flexibleWhitespace: true` (regex path)         | ~40KB of literals |

### Benchmark snapshot

Median wall time per call, from the CI-tracked perf suite (`perf/results.json`):

| Scenario                                                       | Time    | Throughput        |
| -------------------------------------------------------------- | ------- | ----------------- |
| `extract-product-page` (typical product page, 7 vars + a loop) | ~24 μs  | ~42K ops/sec      |
| `match-only` (pre-compiled, match + extract)                   | ~18 μs  | ~57K ops/sec      |
| `compile-cold` (tokenize + build plan, cache miss)             | ~17 μs  | ~59K ops/sec      |
| `extract-log-lines` (100 log lines via `reverseEjsAll`)        | ~267 μs | ~3.7K batches/sec |
| `extract-csv-rows` (1000 rows)                                 | ~1.4 ms | ~0.7K batches/sec |
| `large-page-hybrid` (30KB page, 5 scalars + 50-item loop)      | ~319 μs | ~3.1K ops/sec     |

Numbers are from the Linux-X64 GitHub Actions runner; Apple Silicon is roughly 2-3× faster. Raw numbers live in `perf/results.json` and are regenerated on every push to master. See `CHANGELOG.md` for per-release benchmark deltas — the walker-stack rollout in v3.1.0 cut `extract-product-page` by ~80% on the dev machine.

## Limitations

- **JS expressions** like `<%= price * qty %>` or `<%= name.toUpperCase() %>` are captured under the raw expression text as the key (e.g. `{ "price * qty": "30" }`). The library does not evaluate them or split out the component variables.
- **Adjacent variables** like `<%= a %><%= b %>` with no literal separator are captured as a single joined key (`{ "a + b": "AliceSmith" }`). The individual values are not recoverable because the split point is ambiguous - add static text between them if you need them separate.
- **Complex conditions** like `<% if (a > b) { %>` are captured as booleans under the raw condition text (`{ "a > b": true }`). Bare-identifier conditions still produce clean keys. Pure dotted-path conditions (`if (items.length)`) are ignored.
- **Date coercion** uses `new Date(value)`. The result is a plain JavaScript `Date` object - no timezone or format library is used.

## Error handling

reverse-ejs throws in two situations:

1. **Match failures** - the rendered text doesn't fit the template. Throws a `ReverseEjsError`.
2. **Template-author errors** - the template itself is invalid. Throws a plain `Error`. Examples: `<%- include(varName) %>` (dynamic include filenames are not supported, use a quoted string), a partial name that wasn't provided via `options.partials`, or an include chain deeper than 20 levels (circular include).

### Catching match failures

`ReverseEjsError` is a subclass of `Error`:

```ts
import { reverseEjs, ReverseEjsError } from "reverse-ejs";

try {
	reverseEjs(template, rendered);
} catch (e) {
	if (e instanceof ReverseEjsError) {
		console.error(e.message); // human-readable, points at the variable that failed
		console.error(e.details.regex); // the compiled regex
		console.error(e.details.input); // the input string
	}
}
```

The message identifies the last variable the matcher reached before giving up (including variables inside loop bodies and conditional branches) and shows an excerpt of the rendered text near the failure point, e.g.:

```
Could not match variable "author.name" - unexpected content near "<h1>Hello</h1><p>By Alice". (Access error.details for the full regex and input string.)
```

Long inputs are truncated to a head and tail excerpt joined by `...` so the message stays readable.

The full regex and input live on `e.details` so they don't pollute logs, but they're available when you need to debug a tricky template in a REPL.

### Avoiding exceptions: `safe: true`

If you'd rather branch on a `null` result than wrap every call in `try/catch` - useful when scraping untrusted input or processing log files where you expect some lines to miss - pass `safe: true`:

```ts
const data = reverseEjs(template, rendered, { safe: true });
if (data === null) {
	console.warn("Text did not match the template");
} else {
	// data is the extracted object, fully typed
}
```

### Batch processing with partial failures

For a stream of inputs where some are expected to fail, combine `reverseEjsAll` with `safe: true`. Failing entries become `null` in the output array instead of aborting the whole batch:

```ts
import { reverseEjsAll } from "reverse-ejs";

const logs = ["[INFO] 2026-04-10 app: ready", "garbage line", "[ERROR] 2026-04-10 app: connection refused"];

const parsed = reverseEjsAll("[<%= level %>] <%= date %> <%= service %>: <%= message %>", logs, { safe: true });

// parsed[0] = { level: "INFO", date: "2026-04-10", service: "app", message: "ready" }
// parsed[1] = null
// parsed[2] = { level: "ERROR", date: "2026-04-10", service: "app", message: "connection refused" }

const successes = parsed.filter((row) => row !== null);
```

Without `safe: true`, the first mismatch throws and the remaining inputs are skipped.

### Template-author errors are not catchable in safe mode

`safe: true` only affects match failures. Template-author errors (dynamic includes, missing partials, circular includes) still throw a plain `Error` - they indicate a bug in your template, not a runtime mismatch, so they surface immediately regardless of mode.

## Security considerations

Templates are library-author-controlled; rendered strings often come from external sources (scraped pages, user input, log streams). A few things to keep in mind when pointing reverse-ejs at untrusted input:

- **Use `safe: true` on untrusted input.** Match failures return `null` instead of throwing, so a hostile input can't crash the host process through the error path. Combine with `reverseEjsAll` for batch workloads where some inputs are expected to fail.
- **ReDoS surface is confined to the regex fallback path.** When the fast-path walker handles a template (the majority of real shapes), there is no regex compiled and no backtracking engine involved. The regex path runs only for: `flexibleWhitespace: true`, templates with the same variable captured more than once (back-references), and shapes with back-to-back loops/conditionals the walker can't anchor. If your input sources are adversarial and you use any of those shapes, drop in a linear-time regex engine like [`re2`](https://github.com/uhop/node-re2) — the regex itself is the exposure, so a custom `unescape` does not help.
- **Large inputs are bounded by V8's string length (~1GB) for the fast-path shapes.** The regex path caps at roughly 40KB of literal template size before V8 refuses to compile. If a user-supplied template is in the mix, reject anything above that before passing it to `compileTemplate`.
- **Type coercion never `eval`s.** `types: { age: "number" }` uses `Number(s)`, booleans compare to `"true"` / `"false"` literally, dates use `new Date(s)`. None of them execute strings as code, so coercion itself isn't a code-execution vector.
- **Expressions and complex conditions are captured by string text, not evaluated.** `<%= title.toUpperCase() %>` becomes the key `"title.toUpperCase()"`; the method is not invoked during extraction.

Report security issues privately — a `SECURITY.md` will be added with contact details.

## Contributing

Issues, pull requests, and discussions are welcome at [github.com/lucasrainett/reverse-ejs](https://github.com/lucasrainett/reverse-ejs).

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the development workflow, including:

- The three test suites (unit, end-to-end, performance) and how to run them
- Playwright e2e tests covering every interactive feature of the docs playground
- The performance suite that tracks regex-engine limits and benchmark timings, with CI-driven comparison comments on every PR

## License

MIT
