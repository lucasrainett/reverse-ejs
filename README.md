# reverse-ejs

The inverse of `ejs.render()`. Given an EJS template and the rendered output it produced, extract the data object that was used to render it.

```ts
import { reverseEjs } from "reverse-ejs";

reverseEjs("Hello, <%= name %>!", "Hello, Alice!");
// => { name: "Alice" }
```

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
	/** Custom HTML-unescape function for extracted values. */
	unescape?: (s: string) => string;
	/** Map of partial name to EJS source for include expansion. */
	partials?: Record<string, string>;
}
```

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

## EJS Feature Support

| Feature                                           | Status                              |
| ------------------------------------------------- | ----------------------------------- |
| `<%= var %>` escaped output                       | Supported                           |
| `<%- var %>` raw output                           | Supported                           |
| `<%# comment %>`                                  | Supported (ignored)                 |
| `<%%` / `%%>` literal delimiters                  | Supported                           |
| `-%>` newline slurp                               | Supported                           |
| `<%_` / `_%>` whitespace slurp                    | Supported                           |
| `forEach` / `map` (arrow + function syntax)       | Supported                           |
| `for...of` / `for...in` / classic `for` / `while` | Supported                           |
| `.filter().forEach()` chained                     | Supported                           |
| Nested loops (any depth)                          | Supported                           |
| `if` / `if...else` / `else if` chains             | Supported                           |
| `switch` / `case` / `default`                     | Supported                           |
| `<%- include("file") %>` partials                 | Supported                           |
| Nested includes                                   | Supported                           |
| `locals.varName` prefix stripping                 | Supported                           |
| Repeated variables (backreference)                | Supported                           |
| Custom delimiters                                 | Supported                           |
| `rmWhitespace` option                             | Supported                           |
| Custom `unescape` function                        | Supported                           |
| JS expressions (ternary, method calls)            | Matched anonymously (not extracted) |
| Adjacent variables with no separator              | Throws descriptive error            |
| Dynamic `include(varName)`                        | Throws descriptive error            |

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

- **JS expressions** like `<%= price * qty %>` or `<%= name.toUpperCase() %>` are matched but not extracted. Reversing arbitrary expressions is not possible.
- **Complex conditions** like `<% if (a > b) { %>` are matched but the condition is not extracted. Only simple identifier conditions like `<% if (isAdmin) { %>` produce boolean results.
- **Variable names containing `__`** (double underscore) will be incorrectly treated as nested properties. A variable named `my__var` would be returned as `{ my: { var: "..." } }` instead of `{ my__var: "..." }`.
- **Adjacent variables** like `<%= a %><%= b %>` with no literal separator between them are ambiguous and throw an error.

## License

MIT
