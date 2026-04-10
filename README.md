# reverse-ejs

The inverse of `ejs.render()`. Given an EJS template and the rendered output it produced, extract the data object that was used to render it.

```ts
import { reverseEjs } from "reverse-ejs";

reverseEjs("Hello, <%= name %>!", "Hello, Alice!");
// => { name: "Alice" }
```

**[Try it in the browser](https://lucasrainett.github.io/reverse-ejs/)**

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

Nested includes, shared variables across partials, and includes inside loops are supported.

### Repeated variables

When the same variable appears multiple times, the library enforces that all occurrences have the same value:

```ts
reverseEjs("<title><%= name %></title><h1><%= name %></h1>", "<title>Alice</title><h1>Alice</h1>");
// => { name: "Alice" }
```

## Compiled templates

When processing many rendered strings against the same template, compile it once for better performance:

```ts
import { compileTemplate } from "reverse-ejs";

const compiled = compileTemplate("<%= name %> is <%= age %> years old.");

compiled.match("Alice is 30 years old."); // { name: "Alice", age: "30" }
compiled.match("Bob is 25 years old."); // { name: "Bob", age: "25" }
```

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
	/** Suppress console warnings (skipped expressions, failed coercions). */
	silent?: boolean;
	/** Map of variable name to coercion type. */
	types?: Record<string, "string" | "number" | "boolean" | "date">;
}
```

| Option               | Type     | Default      | Description                           |
| -------------------- | -------- | ------------ | ------------------------------------- |
| `delimiter`          | string   | `"%"`        | Inner delimiter character             |
| `openDelimiter`      | string   | `"<"`        | Opening delimiter character           |
| `closeDelimiter`     | string   | `">"`        | Closing delimiter character           |
| `rmWhitespace`       | boolean  | `false`      | Strip line whitespace before matching |
| `flexibleWhitespace` | boolean  | `false`      | Ignore whitespace differences         |
| `unescape`           | function | XML unescape | Custom HTML-unescape function         |
| `partials`           | object   | `{}`         | Map of partial names to EJS source    |
| `safe`               | boolean  | `false`      | Return `null` instead of throwing     |
| `silent`             | boolean  | `false`      | Suppress console warnings             |
| `types`              | object   | `{}`         | Type coercion map                     |

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

| Feature                                           | Status                                 |
| ------------------------------------------------- | -------------------------------------- |
| `<%= var %>` escaped output                       | Supported                              |
| `<%- var %>` raw output                           | Supported                              |
| `<%# comment %>`                                  | Supported (ignored)                    |
| `<%%` / `%%>` literal delimiters                  | Supported                              |
| `-%>` newline slurp                               | Supported                              |
| `<%_` / `_%>` whitespace slurp                    | Supported                              |
| `forEach` / `map` (arrow + function syntax)       | Supported                              |
| `for...of` / `for...in` / classic `for` / `while` | Supported                              |
| `.filter().forEach()` chained                     | Supported                              |
| Nested loops (any depth)                          | Supported                              |
| `if` / `if...else` / `else if` chains             | Supported                              |
| `switch` / `case` / `default`                     | Supported                              |
| `<%- include("file") %>` partials                 | Supported                              |
| Nested includes                                   | Supported                              |
| `locals.varName` prefix stripping                 | Supported                              |
| Repeated variables (backreference)                | Supported                              |
| Custom delimiters                                 | Supported                              |
| `rmWhitespace` option                             | Supported                              |
| Custom `unescape` function                        | Supported                              |
| JS expressions (ternary, method calls)            | Matched anonymously, warns             |
| Adjacent variables with no separator              | Throws `ReverseEjsError` with location |
| Dynamic `include(varName)`                        | Throws descriptive error               |
| Type coercion (number / boolean / date)           | Via `types` option                     |
| Compiled templates (`compileTemplate`)            | For repeated extractions               |
| Batch extraction (`reverseEjsAll`)                | Multiple inputs, one template          |
| Safe mode (`safe: true`)                          | Returns `null` instead of throwing     |

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

## How It Works

The library converts an EJS template into a regular expression with named capture groups, then matches it against the rendered string:

1. **Tokenize** - Split the template using EJS's own delimiter logic
2. **Build pattern** - Convert tokens into an AST (literals, variables, loops, conditionals)
3. **Build regex** - Convert the AST into a regex with named captures, backreferences, and alternations
4. **Extract** - Execute the regex against the rendered string and map captures back to variable names

## Limitations

- **JS expressions** like `<%= price * qty %>` or `<%= name.toUpperCase() %>` are matched but not extracted. The library logs a warning so you know the expression was skipped (suppress with `silent: true`).
- **Complex conditions** like `<% if (a > b) { %>` are matched but the condition is not extracted. Only simple identifier conditions like `<% if (isAdmin) { %>` produce boolean results.
- **Variable names containing `__`** (double underscore) will be incorrectly treated as nested properties. A variable named `my__var` would be returned as `{ my: { var: "..." } }` instead of `{ my__var: "..." }`.
- **Adjacent variables** like `<%= a %><%= b %>` with no literal separator between them are ambiguous and throw a `ReverseEjsError` with the variable names and template position.
- **Date coercion** uses `new Date(value)`. The result is a plain JavaScript `Date` object - no timezone or format library is used.

## Error handling

Match failures throw a `ReverseEjsError` (subclass of `Error`):

```ts
import { reverseEjs, ReverseEjsError } from "reverse-ejs";

try {
	reverseEjs(template, html);
} catch (e) {
	if (e instanceof ReverseEjsError) {
		console.error(e.message); // human-readable
		console.error(e.details.regex); // the compiled regex
		console.error(e.details.input); // the input string
	}
}
```

The error message identifies the variable that failed to match and shows an excerpt of the rendered string near the failure point. The full regex and input are on `error.details` so they don't pollute the message.

## Contributing

Issues, pull requests, and discussions are welcome at [github.com/lucasrainett/reverse-ejs](https://github.com/lucasrainett/reverse-ejs).

## License

MIT
