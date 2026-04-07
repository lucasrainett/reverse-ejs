import { test, expect } from "vitest";
import { reverseEjs } from "../src/index";

// ─── 1. Simple variable extraction ───────────────────────────────────────────
test("extracts a single variable", () => {
	const template = "Hello, <%= name %>!";
	const final = "Hello, John!";
	expect(reverseEjs(template, final)).toEqual({ name: "John" });
});

// ─── 2. Multiple variables ────────────────────────────────────────────────────
test("extracts multiple variables", () => {
	const template = "Hello, <%= firstName %> <%= lastName %>!";
	const final = "Hello, John Doe!";
	expect(reverseEjs(template, final)).toEqual({
		firstName: "John",
		lastName: "Doe",
	});
});

// ─── 3. Simple loop — string array ───────────────────────────────────────────
test("extracts a simple loop as a string array", () => {
	const template =
		"<% items.forEach(item => { %><li><%= item %></li><% }) %>";
	const final = "<li>Apple</li><li>Banana</li><li>Cherry</li>";
	expect(reverseEjs(template, final)).toEqual({
		items: ["Apple", "Banana", "Cherry"],
	});
});

// ─── 4. Loop with object items ────────────────────────────────────────────────
test("extracts a loop as an object array", () => {
	const template =
		"<% users.forEach(user => { %><li><%= user.name %> - <%= user.age %></li><% }) %>";
	const final = "<li>John - 30</li><li>Jane - 25</li>";
	expect(reverseEjs(template, final)).toEqual({
		users: [
			{ name: "John", age: "30" },
			{ name: "Jane", age: "25" },
		],
	});
});

// ─── 5. Mixed variables and loop ─────────────────────────────────────────────
test("extracts variables and a loop together", () => {
	const template =
		"<h1><%= title %></h1><% items.forEach(item => { %><li><%= item %></li><% }) %>";
	const final = "<h1>Shopping List</h1><li>Apple</li><li>Banana</li>";
	expect(reverseEjs(template, final)).toEqual({
		title: "Shopping List",
		items: ["Apple", "Banana"],
	});
});

// ─── 6. Nested loops ─────────────────────────────────────────────────────────
test("extracts nested loops", () => {
	const template =
		"<% categories.forEach(cat => { %>" +
		"<h2><%= cat.name %></h2>" +
		"<% cat.items.forEach(item => { %><li><%= item %></li><% }) %>" +
		"<% }) %>";

	const final =
		"<h2>Fruits</h2><li>Apple</li><li>Banana</li>" +
		"<h2>Veggies</h2><li>Carrot</li>";

	expect(reverseEjs(template, final)).toEqual({
		categories: [
			{ name: "Fruits", items: ["Apple", "Banana"] },
			{ name: "Veggies", items: ["Carrot"] },
		],
	});
});

// ─── 7. Plain text (non-HTML) ─────────────────────────────────────────────────
test("works with plain text templates", () => {
	const template = "Dear <%= name %>, your order <%= orderId %> has shipped.";
	const final = "Dear John, your order #1234 has shipped.";
	expect(reverseEjs(template, final)).toEqual({
		name: "John",
		orderId: "#1234",
	});
});

// ─── 8. Empty loop ────────────────────────────────────────────────────────────
test("returns an empty array for a loop with zero iterations", () => {
	const template =
		"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>";
	const final = "<ul></ul>";
	expect(reverseEjs(template, final)).toEqual({ items: [] });
});

// ─── 9. Multiline plain text ──────────────────────────────────────────────────
test("handles multiline templates", () => {
	const template = "Name: <%= name %>\nAge: <%= age %>\nCity: <%= city %>";
	const final = "Name: John\nAge: 30\nCity: New York";
	expect(reverseEjs(template, final)).toEqual({
		name: "John",
		age: "30",
		city: "New York",
	});
});

// ─── 10. Values with special characters ──────────────────────────────────────
test("handles values containing special characters", () => {
	const template = "<p><%= message %></p>";
	const final = "<p>Hello & welcome to <the> party!</p>";
	expect(reverseEjs(template, final)).toEqual({
		message: "Hello & welcome to <the> party!",
	});
});

// ════════════════════════════════════════════════════════════════════════════
// COMPLEX SCENARIOS
// ════════════════════════════════════════════════════════════════════════════

// ─── 11. Two separate loops at the same level ─────────────────────────────
test("extracts two independent loops at the same level", () => {
	const template =
		"<h2>Fruits</h2><% fruits.forEach(f => { %><li><%= f %></li><% }) %>" +
		"<h2>Colors</h2><% colors.forEach(c => { %><span><%= c %></span><% }) %>";
	const final =
		"<h2>Fruits</h2><li>Apple</li><li>Banana</li>" +
		"<h2>Colors</h2><span>Red</span><span>Blue</span>";
	expect(reverseEjs(template, final)).toEqual({
		fruits: ["Apple", "Banana"],
		colors: ["Red", "Blue"],
	});
});

// ─── 12. Loop with exactly one iteration ─────────────────────────────────
test("handles a loop with exactly one iteration", () => {
	const template =
		"<% items.forEach(item => { %><li><%= item %></li><% }) %>";
	const final = "<li>OnlyItem</li>";
	expect(reverseEjs(template, final)).toEqual({ items: ["OnlyItem"] });
});

// ─── 13. Same variable used twice in the template ────────────────────────
test("handles a variable referenced multiple times", () => {
	const template = "<title><%= name %></title><h1><%= name %></h1>";
	const final = "<title>John</title><h1>John</h1>";
	expect(reverseEjs(template, final)).toEqual({ name: "John" });
});

// ─── 14. Loop items with many fields ─────────────────────────────────────
test("extracts loop items with four properties each", () => {
	const template =
		"<% products.forEach(p => { %>" +
		"<div><%= p.id %>,<%= p.name %>,<%= p.price %>,<%= p.stock %></div>" +
		"<% }) %>";
	const final =
		"<div>1,Widget,9.99,100</div>" + "<div>2,Gadget,24.99,50</div>";
	expect(reverseEjs(template, final)).toEqual({
		products: [
			{ id: "1", name: "Widget", price: "9.99", stock: "100" },
			{ id: "2", name: "Gadget", price: "24.99", stock: "50" },
		],
	});
});

// ─── 15. Three levels of nested loops ────────────────────────────────────
test("extracts three levels of nested loops", () => {
	const template =
		"<% continents.forEach(cont => { %>" +
		"<h1><%= cont.name %></h1>" +
		"<% cont.countries.forEach(country => { %>" +
		"<h2><%= country.name %></h2>" +
		"<% country.cities.forEach(city => { %>" +
		"<li><%= city %></li>" +
		"<% }) %>" +
		"<% }) %>" +
		"<% }) %>";

	const final =
		"<h1>Europe</h1>" +
		"<h2>France</h2><li>Paris</li><li>Lyon</li>" +
		"<h2>Germany</h2><li>Berlin</li>" +
		"<h1>Asia</h1>" +
		"<h2>Japan</h2><li>Tokyo</li>";

	expect(reverseEjs(template, final)).toEqual({
		continents: [
			{
				name: "Europe",
				countries: [
					{ name: "France", cities: ["Paris", "Lyon"] },
					{ name: "Germany", cities: ["Berlin"] },
				],
			},
			{
				name: "Asia",
				countries: [{ name: "Japan", cities: ["Tokyo"] }],
			},
		],
	});
});

// ─── 16. CSV-style plain text output ─────────────────────────────────────
test("parses CSV-style plain text from a loop", () => {
	const template =
		"<% rows.forEach(row => { %><%= row.name %>,<%= row.age %>,<%= row.city %>\n<% }) %>";
	const final = "Alice,30,New York\nBob,25,London\n";
	expect(reverseEjs(template, final)).toEqual({
		rows: [
			{ name: "Alice", age: "30", city: "New York" },
			{ name: "Bob", age: "25", city: "London" },
		],
	});
});

// ─── 17. Realistic email template ────────────────────────────────────────
test("parses a realistic email template", () => {
	const template =
		"Dear <%= recipient %>,\n\n" +
		"Your invoice #<%= invoiceId %> for $<%= amount %> is due on <%= dueDate %>.\n\n" +
		"Items:\n" +
		"<% lineItems.forEach(item => { %>" +
		"- <%= item.description %>: $<%= item.cost %>\n" +
		"<% }) %>\n" +
		"Regards,\n<%= sender %>";

	const final =
		"Dear Alice,\n\n" +
		"Your invoice #INV-001 for $150.00 is due on 2024-12-31.\n\n" +
		"Items:\n" +
		"- Widget x2: $50.00\n" +
		"- Shipping: $10.00\n" +
		"- Tax: $14.00\n" +
		"\n" +
		"Regards,\nAcme Corp";

	expect(reverseEjs(template, final)).toEqual({
		recipient: "Alice",
		invoiceId: "INV-001",
		amount: "150.00",
		dueDate: "2024-12-31",
		lineItems: [
			{ description: "Widget x2", cost: "50.00" },
			{ description: "Shipping", cost: "10.00" },
			{ description: "Tax", cost: "14.00" },
		],
		sender: "Acme Corp",
	});
});

// ─── 18. Variables before, inside and after a loop ───────────────────────
test("extracts variables surrounding a loop on both sides", () => {
	const template =
		"Hello <%= name %>!\n" +
		"<% items.forEach(item => { %>- <%= item %>\n<% }) %>" +
		"Total: <%= count %> items.";

	const final =
		"Hello World!\n" +
		"- Alpha\n" +
		"- Beta\n" +
		"- Gamma\n" +
		"Total: 3 items.";

	expect(reverseEjs(template, final)).toEqual({
		name: "World",
		items: ["Alpha", "Beta", "Gamma"],
		count: "3",
	});
});

// ─── 19. EJS comments are silently ignored ───────────────────────────────
test("ignores EJS comments in the template", () => {
	const template = "<%# page title %>Hello, <%= name %>!<%# end %>";
	const final = "Hello, Alice!";
	expect(reverseEjs(template, final)).toEqual({ name: "Alice" });
});

// ─── 20. Table with caption, rows, and footer ────────────────────────────
test("parses table-like HTML with variables and a loop", () => {
	const template =
		"<table><caption><%= caption %></caption>" +
		"<% rows.forEach(row => { %>" +
		"<tr><td><%= row.id %></td><td><%= row.label %></td><td><%= row.value %></td></tr>" +
		"<% }) %>" +
		'<tfoot><td colspan="3"><%= footer %></td></tfoot></table>';

	const final =
		"<table><caption>Results</caption>" +
		"<tr><td>1</td><td>Alpha</td><td>100</td></tr>" +
		"<tr><td>2</td><td>Beta</td><td>200</td></tr>" +
		"<tr><td>3</td><td>Gamma</td><td>300</td></tr>" +
		'<tfoot><td colspan="3">End of report</td></tfoot></table>';

	expect(reverseEjs(template, final)).toEqual({
		caption: "Results",
		rows: [
			{ id: "1", label: "Alpha", value: "100" },
			{ id: "2", label: "Beta", value: "200" },
			{ id: "3", label: "Gamma", value: "300" },
		],
		footer: "End of report",
	});
});

// ─── 21. Throws on mismatch ───────────────────────────────────────────────
test("throws a descriptive error when the string does not match the template", () => {
	const template = "Hello, <%= name %>!";
	const final = "Goodbye, John!";
	expect(() => reverseEjs(template, final)).toThrow("does not match");
});

// ════════════════════════════════════════════════════════════════════════════
// UNCOVERED EJS FEATURES
// ════════════════════════════════════════════════════════════════════════════

// ─── RAW / UNESCAPED OUTPUT (<%-) ────────────────────────────────────────────
// <%- outputs the value without HTML escaping (vs <%= which escapes it).
// For reverse purposes the extraction logic is identical.

test("<%- raw tag: extracts a single unescaped variable", () => {
	const template = "<p><%- content %></p>";
	const final = "<p><b>bold text</b></p>";
	expect(reverseEjs(template, final)).toEqual({
		content: "<b>bold text</b>",
	});
});

test("<%- raw tag: mixed escaped and unescaped variables", () => {
	const template = "<h1><%= title %></h1><div><%- body %></div>";
	const final = "<h1>My Page</h1><div><p>Hello <em>world</em></p></div>";
	expect(reverseEjs(template, final)).toEqual({
		title: "My Page",
		body: "<p>Hello <em>world</em></p>",
	});
});

test("<%- raw tag: inside a loop", () => {
	const template =
		"<% items.forEach(item => { %><li><%- item.html %></li><% }) %>";
	const final = "<li><b>Alpha</b></li><li><em>Beta</em></li>";
	expect(reverseEjs(template, final)).toEqual({
		items: [{ html: "<b>Alpha</b>" }, { html: "<em>Beta</em>" }],
	});
});

// ─── LITERAL <% OUTPUT (<%%) ─────────────────────────────────────────────────
//<%% outputs a literal '<%' string in the rendered output.

test("<%%: literal <% in output is treated as plain text", () => {
	const template = "<p>Use <%%> to escape. Value: <%= val %></p>";
	const final = "<p>Use <%> to escape. Value: 42</p>"; // <%%> → <%>
	expect(reverseEjs(template, final)).toEqual({ val: "42" });
});

test("<%%: multiple literal <% sequences alongside variables", () => {
	const template = "<%% start %%> <%= name %> <%% end %%>";
	const final = "<% start %> Alice <% end %>";
	expect(reverseEjs(template, final)).toEqual({ name: "Alice" });
});

// ─── NEWLINE SLURP (-%>) ─────────────────────────────────────────────────────
// -%> trims the newline that immediately follows the tag.
// EJS uses this to avoid blank lines in the output from control-flow tags.

test("-%>: newline after loop tag is trimmed from output", () => {
	// Without -%> the \n after %> would appear in the output; with it, it's gone.
	const template =
		"<% items.forEach(item => { -%>\n" +
		"<li><%= item %></li>\n" +
		"<% }) -%>\n";
	const final = "<li>Alpha</li>\n<li>Beta</li>\n";
	expect(reverseEjs(template, final)).toEqual({ items: ["Alpha", "Beta"] });
});

test("-%>: newline slurp on variable tag", () => {
	const template = "Name: <%= name -%>\nAge: <%= age %>";
	const final = "Name: AliceAge: 30";
	expect(reverseEjs(template, final)).toEqual({ name: "Alice", age: "30" });
});

// ─── WHITESPACE SLURPING (<%_ and _%>) ───────────────────────────────────────
// <%_ strips all whitespace (spaces/tabs) BEFORE the tag.
// _%> strips all whitespace AFTER the tag.

test("<%_: leading whitespace before scriptlet is stripped from output", () => {
	const template =
		"    <%_ items.forEach(item => { %><li><%= item %></li><%_ }) %>";
	const final = "<li>One</li><li>Two</li>";
	expect(reverseEjs(template, final)).toEqual({ items: ["One", "Two"] });
});

test("_%>: trailing whitespace after scriptlet is stripped from output", () => {
	const template =
		"<% items.forEach(item => { _%>   <li><%= item %></li><% }) %>";
	const final = "<li>One</li><li>Two</li>";
	expect(reverseEjs(template, final)).toEqual({ items: ["One", "Two"] });
});

test("<%_ and _%>: both slurping modifiers used together", () => {
	const template =
		"<%_ items.forEach(item => { _%>" +
		"  <li><%= item %></li>\n" +
		"<%_ }) _%>";
	const final = "<li>Alpha</li>\n<li>Beta</li>\n";
	expect(reverseEjs(template, final)).toEqual({ items: ["Alpha", "Beta"] });
});

// ─── HTML ESCAPING IN <%= %> ──────────────────────────────────────────────────
// <%= escapes HTML entities: < → &lt;  > → &gt;  & → &amp;  " → &quot;
// The rendered string contains escaped values; reverse-ejs should unescape them
// to return the original data value.

test("HTML escaping: extracts original value when <%= escapes HTML entities", () => {
	const template = "<p><%= content %></p>";
	const final = "<p>&lt;b&gt;bold&lt;/b&gt;</p>";
	// Original data was: { content: '<b>bold</b>' }
	expect(reverseEjs(template, final)).toEqual({ content: "<b>bold</b>" });
});

test("HTML escaping: ampersands and quotes are unescaped", () => {
	const template = '<meta name="desc" content="<%= description %>">';
	const final = '<meta name="desc" content="AT&amp;T &quot;wireless&quot;">';
	expect(reverseEjs(template, final)).toEqual({
		description: 'AT&T "wireless"',
	});
});

test("HTML escaping: values with multiple entity types", () => {
	const template =
		"<% items.forEach(item => { %><li><%= item.label %></li><% }) %>";
	const final =
		"<li>a &lt; b</li><li>x &amp; y</li><li>&quot;quoted&quot;</li>";
	expect(reverseEjs(template, final)).toEqual({
		items: [{ label: "a < b" }, { label: "x & y" }, { label: '"quoted"' }],
	});
});

// ─── FOR...OF LOOP ────────────────────────────────────────────────────────────
// EJS supports any JS loop syntax, not just forEach.

test("for...of: extracts a simple string array", () => {
	const template =
		"<% for (const item of items) { %><li><%= item %></li><% } %>";
	const final = "<li>Alpha</li><li>Beta</li><li>Gamma</li>";
	expect(reverseEjs(template, final)).toEqual({
		items: ["Alpha", "Beta", "Gamma"],
	});
});

test("for...of: extracts object array", () => {
	const template =
		"<% for (const user of users) { %>" +
		"<p><%= user.name %>: <%= user.role %></p>" +
		"<% } %>";
	const final = "<p>Alice: admin</p><p>Bob: viewer</p>";
	expect(reverseEjs(template, final)).toEqual({
		users: [
			{ name: "Alice", role: "admin" },
			{ name: "Bob", role: "viewer" },
		],
	});
});

// ─── FOREACH WITH INDEX ───────────────────────────────────────────────────────
// forEach supports a second (index) argument: items.forEach((item, i) => {
// The index is typically used in the template output (e.g. numbering rows).

test("forEach with index: index value appears in output", () => {
	const template =
		"<% items.forEach((item, i) => { %>" +
		"<li><%= i %>. <%= item %></li>" +
		"<% }) %>";
	const final = "<li>0. Alpha</li><li>1. Beta</li><li>2. Gamma</li>";
	// 'i' is a derived value, not original data — library should still extract 'item'
	expect(reverseEjs(template, final)).toEqual({
		items: ["Alpha", "Beta", "Gamma"],
	});
});

test("forEach with index: index used in class name alongside item properties", () => {
	const template =
		"<% rows.forEach((row, idx) => { %>" +
		'<tr class="row-<%= idx %>"><td><%= row.name %></td></tr>' +
		"<% }) %>";
	const final =
		'<tr class="row-0"><td>Alice</td></tr>' +
		'<tr class="row-1"><td>Bob</td></tr>';
	expect(reverseEjs(template, final)).toEqual({
		rows: [{ name: "Alice" }, { name: "Bob" }],
	});
});

// ─── IF / ELSE CONDITIONALS ───────────────────────────────────────────────────
// Conditional blocks may or may not appear in the output depending on data.
// This is fundamentally ambiguous for reverse extraction — the library should
// handle the case where the condition was truthy (section present in output).

test("if block: extracts variable when condition was true", () => {
	const template = "<% if (user) { %><h1><%= user.name %></h1><% } %>";
	const final = "<h1>Alice</h1>";
	expect(reverseEjs(template, final)).toEqual({
		"user.name": "Alice",
		user: true,
	});
});

test("if/else block: extracts from the matching branch", () => {
	const template =
		"<% if (isAdmin) { %>" +
		"<p>Welcome, admin <%= name %>!</p>" +
		"<% } else { %>" +
		"<p>Welcome, <%= name %>!</p>" +
		"<% } %>";
	// Truthy branch was rendered
	const finalTrue = "<p>Welcome, admin Alice!</p>";
	// Falsy branch was rendered
	const finalFalse = "<p>Welcome, Bob!</p>";
	expect(reverseEjs(template, finalTrue)).toEqual({
		name: "Alice",
		isAdmin: true,
	});
	expect(reverseEjs(template, finalFalse)).toEqual({
		name: "Bob",
		isAdmin: false,
	});
});

test("if block surrounding a loop: extracts array when block was rendered", () => {
	const template =
		"<% if (items.length) { %>" +
		"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>" +
		"<% } %>";
	const final = "<ul><li>Alpha</li><li>Beta</li></ul>";
	expect(reverseEjs(template, final)).toEqual({ items: ["Alpha", "Beta"] });
});

// ════════════════════════════════════════════════════════════════════════════
// COMPLEX IF/ELSE SCENARIOS
// ════════════════════════════════════════════════════════════════════════════

// ─── 42. Two independent if/else blocks with literal-only branches ────────────
// Each conditional has pure-literal branches — condition must be inferred from
// the zero-length sentinel alone (no variable captures to piggyback on).
test("two independent if/else conditions with literal-only branches", () => {
	const template =
		"<% if (isVerified) { %>✓<% } else { %>✗<% } %> " +
		"<%= username %> " +
		"<% if (isOnline) { %>(online)<% } else { %>(offline)<% } %>";

	expect(reverseEjs(template, "✓ Alice (online)")).toEqual({
		isVerified: true,
		username: "Alice",
		isOnline: true,
	});
	expect(reverseEjs(template, "✗ Bob (offline)")).toEqual({
		isVerified: false,
		username: "Bob",
		isOnline: false,
	});
	expect(reverseEjs(template, "✓ Carol (offline)")).toEqual({
		isVerified: true,
		username: "Carol",
		isOnline: false,
	});
});

// ─── 43. if/else where only the then branch has variables ─────────────────────
// The else branch is pure text.  Variables only appear in the result when
// the then branch was taken.
test("if/else: extra variable only present in the then branch", () => {
	const template =
		"<% if (hasBadge) { %>" +
		'<span class="badge"><%= badge %></span> ' +
		"<% } else { %>" +
		'<span class="no-badge"></span> ' +
		"<% } %>" +
		"<%= name %>";

	expect(
		reverseEjs(template, '<span class="badge">Gold</span> Alice'),
	).toEqual({
		hasBadge: true,
		badge: "Gold",
		name: "Alice",
	});
	expect(reverseEjs(template, '<span class="no-badge"></span> Bob')).toEqual({
		hasBadge: false,
		name: "Bob",
	});
});

// ─── 44. Nested if/else — two levels deep ────────────────────────────────────
// The outer condition (isLoggedIn) and inner condition (isAdmin) are each
// extracted.  When the outer-else branch runs, the inner conditional is
// unreachable so isAdmin must NOT appear in the result.
test("nested if/else: two levels deep, inner condition only when outer is true", () => {
	const template =
		"<% if (isLoggedIn) { %>" +
		"<% if (isAdmin) { %>" +
		"<p>Admin: <%= name %></p>" +
		"<% } else { %>" +
		"<p>User: <%= name %></p>" +
		"<% } %>" +
		"<% } else { %>" +
		"<p>Guest</p>" +
		"<% } %>";

	expect(reverseEjs(template, "<p>Admin: Alice</p>")).toEqual({
		isLoggedIn: true,
		isAdmin: true,
		name: "Alice",
	});
	expect(reverseEjs(template, "<p>User: Bob</p>")).toEqual({
		isLoggedIn: true,
		isAdmin: false,
		name: "Bob",
	});
	// Outer else ran → inner conditional never evaluated → isAdmin absent
	expect(reverseEjs(template, "<p>Guest</p>")).toEqual({
		isLoggedIn: false,
	});
});

// ─── 45. if/else with a loop inside the then branch ──────────────────────────
// When the condition is false the loop capture is undefined, so the array
// must not appear in the result.
test("if/else: loop inside then branch, no loop data when else runs", () => {
	const template =
		"<% if (hasItems) { %>" +
		"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>" +
		"<% } else { %>" +
		"<p>No items.</p>" +
		"<% } %>";

	expect(
		reverseEjs(template, "<ul><li>Alpha</li><li>Beta</li></ul>"),
	).toEqual({
		hasItems: true,
		items: ["Alpha", "Beta"],
	});
	expect(reverseEjs(template, "<p>No items.</p>")).toEqual({
		hasItems: false,
	});
});

// ─── 46. if/else with the same variable names in both branches ────────────────
// firstName and lastName appear in both the then and else branch.  The regex
// alternation ensures only the matching branch's captures make it into the
// result, and both are correctly unescaped.
test("if/else: same variable names in both branches resolve to one value each", () => {
	const template =
		"<% if (isPaid) { %>" +
		"<%= firstName %> <%= lastName %> — Premium" +
		"<% } else { %>" +
		"<%= firstName %> <%= lastName %> — Free" +
		"<% } %>";

	expect(reverseEjs(template, "Alice Smith — Premium")).toEqual({
		isPaid: true,
		firstName: "Alice",
		lastName: "Smith",
	});
	expect(reverseEjs(template, "Bob Jones — Free")).toEqual({
		isPaid: false,
		firstName: "Bob",
		lastName: "Jones",
	});
});

// ════════════════════════════════════════════════════════════════════════════
// INCLUDE FEATURE
// All tests pass a `partials` map so no filesystem access is required.
// Includes are expanded before tokenising, so partial content is treated as
// an inline fragment — variables and loops inside partials are extracted
// exactly like top-level template content.
// ════════════════════════════════════════════════════════════════════════════

// ─── 47. Basic include — single variable ─────────────────────────────────────
test("include: extracts a variable defined inside a partial", () => {
	const partials = { greeting: "<p>Hello, <%= name %>!</p>" };
	const template = '<%- include("greeting") %>';
	const final = "<p>Hello, Alice!</p>";
	expect(reverseEjs(template, final, { partials })).toEqual({
		name: "Alice",
	});
});

// ─── 48. Include alongside parent template variables ─────────────────────────
test("include: partial variables merge with parent template variables", () => {
	const partials = { header: "<h1><%= title %></h1>" };
	const template = '<%- include("header") %><main><%= body %></main>';
	const final = "<h1>My Page</h1><main>Welcome!</main>";
	expect(reverseEjs(template, final, { partials })).toEqual({
		title: "My Page",
		body: "Welcome!",
	});
});

// ─── 49. Include containing a forEach loop ───────────────────────────────────
test("include: loop inside partial is fully extracted", () => {
	const partials = {
		list: "<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>",
	};
	const template = '<h2><%= heading %></h2><%- include("list") %>';
	const final =
		"<h2>Fruits</h2><ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>";
	expect(reverseEjs(template, final, { partials })).toEqual({
		heading: "Fruits",
		items: ["Apple", "Banana", "Cherry"],
	});
});

// ─── 50. Partial with object array loop ──────────────────────────────────────
test("include: partial with object-array loop extracts item properties", () => {
	const partials = {
		"user-list":
			"<% users.forEach(user => { %>" +
			"<li><%= user.name %> &lt;<%= user.email %>&gt;</li>" +
			"<% }) %>",
	};
	const template = '<ul><%- include("user-list") %></ul>';
	const final =
		"<ul><li>Alice &lt;alice@example.com&gt;</li><li>Bob &lt;bob@example.com&gt;</li></ul>";
	expect(reverseEjs(template, final, { partials })).toEqual({
		users: [
			{ name: "Alice", email: "alice@example.com" },
			{ name: "Bob", email: "bob@example.com" },
		],
	});
});

// ─── 51. Nested includes (partial includes another partial) ───────────────────
test("include: nested partial expansion — grandchild variables extracted", () => {
	const partials = {
		layout: '<header><%- include("nav") %></header><main><%= pageContent %></main>',
		nav: "<nav><%= navTitle %></nav>",
	};
	const template = '<%- include("layout") %>';
	const final = "<header><nav>Main Menu</nav></header><main>Our story</main>";
	expect(reverseEjs(template, final, { partials })).toEqual({
		navTitle: "Main Menu",
		pageContent: "Our story",
	});
});

// ─── 52. Same partial included twice ─────────────────────────────────────────
// The second occurrence of a variable from a repeated partial becomes a
// back-reference in the regex — the value must be identical in both places.
test("include: same partial included twice enforces consistent variable values", () => {
	const partials = { divider: '<hr data-style="<%= dividerStyle %>">' };
	const template =
		"<%= intro %>" +
		'<%- include("divider") %>' +
		"<%= content %>" +
		'<%- include("divider") %>' +
		"<%= outro %>";
	const final =
		'Top<hr data-style="thick">Middle<hr data-style="thick">Bottom';
	expect(reverseEjs(template, final, { partials })).toEqual({
		intro: "Top",
		dividerStyle: "thick",
		content: "Middle",
		outro: "Bottom",
	});
});

// ─── 53. Single-quotes and double-quotes both accepted ────────────────────────
test("include: single-quote and double-quote syntax are both valid", () => {
	const partials = { footer: "<footer>&copy; <%= year %></footer>" };
	const tDouble = '<%- include("footer") %>';
	const tSingle = "<%- include('footer') %>";
	const final = "<footer>&copy; 2025</footer>";
	// unescaping: &copy; stays (not in our entity map); © is not a known entity
	expect(reverseEjs(tDouble, final, { partials })).toEqual({ year: "2025" });
	expect(reverseEjs(tSingle, final, { partials })).toEqual({ year: "2025" });
});

// ─── 54. Partial name with path separators ────────────────────────────────────
test("include: partial name may contain forward slashes (path-style key)", () => {
	const partials = { "partials/hero": "<section><%= heroText %></section>" };
	const template = '<%- include("partials/hero") %><p><%= tagline %></p>';
	const final = "<section>Save the world</section><p>One line at a time</p>";
	expect(reverseEjs(template, final, { partials })).toEqual({
		heroText: "Save the world",
		tagline: "One line at a time",
	});
});

// ─── 55. Include with locals syntax (locals object is ignored) ───────────────
// EJS allows <%- include('file', { key: value }) %> to pass local variables
// to the partial.  reverse-ejs ignores the locals object and extracts
// variables from the rendered output as usual.
test("include: locals argument syntax is accepted without breaking extraction", () => {
	const partials = { card: '<div class="card"><%= cardTitle %></div>' };
	const template = '<%- include("card", { cardTitle: title }) %>';
	const final = '<div class="card">Welcome</div>';
	expect(reverseEjs(template, final, { partials })).toEqual({
		cardTitle: "Welcome",
	});
});

// ─── 56. Error: missing partial ───────────────────────────────────────────────
test("include: throws a descriptive error when the referenced partial is absent", () => {
	const template = '<p>Before</p><%- include("missing") %><p>After</p>';
	expect(() =>
		reverseEjs(template, "<p>Before</p>anything<p>After</p>", {
			partials: {},
		}),
	).toThrow('Partial "missing" not found');
});

// ════════════════════════════════════════════════════════════════════════════
// UNSUPPORTED FEATURES
// These tests specify the *desired* behaviour once each gap is filled.
// Every test in this section currently fails — that is expected.
// ════════════════════════════════════════════════════════════════════════════

// ─── A. Expressions in output tags ───────────────────────────────────────────
// Currently throws "Invalid regular expression: Invalid capture group name".
// Desired behaviour: the expression is matched anonymously (the output still
// has to match the template structure) but is NOT added to the result, because
// reversing an arbitrary JS expression is impossible.

// ─── 57. Ternary ─────────────────────────────────────────────────────────────
test("expression: ternary is matched anonymously — not added to result", () => {
	const template = '<p><%= active ? "Online" : "Offline" %></p>';
	const final = "<p>Online</p>";
	// Cannot recover `active` from "Online"; the value is silently consumed.
	expect(reverseEjs(template, final)).toEqual({});
});

// ─── 58. Method call ─────────────────────────────────────────────────────────
test("expression: method call is matched anonymously — not added to result", () => {
	const template = "<h1><%= title.toUpperCase() %></h1>";
	const final = "<h1>HELLO WORLD</h1>";
	expect(reverseEjs(template, final)).toEqual({});
});

// ─── 59. Arithmetic ──────────────────────────────────────────────────────────
test("expression: arithmetic is skipped; plain variables in the same template are still extracted", () => {
	const template = "<td><%= price * qty %></td><td>$<%= price %></td>";
	const final = "<td>15</td><td>$5</td>";
	// price * qty cannot be reversed; plain `price` is captured normally.
	expect(reverseEjs(template, final)).toEqual({ price: "5" });
});

// ─── 60. Bracket access inside a loop body ───────────────────────────────────
test("expression: bracket access in loop body is matched anonymously", () => {
	// item.tags[0] uses bracket notation — not a valid capture path.
	// The loop is still recognised; each item yields an empty object.
	const template =
		"<% posts.forEach(post => { %>" +
		"<li><%= post.title %> [<%= post.tags[0] %>]</li>" +
		"<% }) %>";
	const final = "<li>Hello [ejs]</li><li>World [js]</li>";
	expect(reverseEjs(template, final)).toEqual({
		posts: [{ title: "Hello" }, { title: "World" }],
	});
});

// ─── 61. Nullish coalescing ───────────────────────────────────────────────────
test("expression: nullish coalescing is skipped; surrounding plain vars extracted", () => {
	const template = "<%= nickname ?? username %> — <%= username %>";
	const final = "alice — alice";
	// nickname ?? username matched anonymously; `username` captured from the literal part.
	expect(reverseEjs(template, final)).toEqual({ username: "alice" });
});

// ─── B. else if chains ────────────────────────────────────────────────────────
// Currently throws "Template does not match" because `} else if (cond) {`
// is not matched by ELSE_REGEX which only accepts `} else {`.
// Desired: each branch of the chain is a valid alternative.

// ─── 62. Variables extracted from the matching else-if branch ────────────────
test("else if: extracts variable from whichever branch matched", () => {
	const template =
		'<% if (role === "admin") { %>' +
		'<p class="admin"><%= name %></p>' +
		'<% } else if (role === "mod") { %>' +
		'<p class="mod"><%= name %></p>' +
		"<% } else { %>" +
		'<p class="user"><%= name %></p>' +
		"<% } %>";

	expect(reverseEjs(template, '<p class="admin">Alice</p>')).toEqual({
		name: "Alice",
	});
	expect(reverseEjs(template, '<p class="mod">Bob</p>')).toEqual({
		name: "Bob",
	});
	expect(reverseEjs(template, '<p class="user">Carol</p>')).toEqual({
		name: "Carol",
	});
});

// ─── 63. Simple identifier conditions are extracted as booleans in a chain ───
test("else if: simple-identifier conditions become booleans in the result", () => {
	const template =
		"<% if (isPremium) { %>" +
		"<span>Premium</span>" +
		"<% } else if (isBasic) { %>" +
		"<span>Basic</span>" +
		"<% } else { %>" +
		"<span>Free</span>" +
		"<% } %>";

	expect(reverseEjs(template, "<span>Premium</span>")).toEqual({
		isPremium: true,
	});
	expect(reverseEjs(template, "<span>Basic</span>")).toEqual({
		isPremium: false,
		isBasic: true,
	});
	expect(reverseEjs(template, "<span>Free</span>")).toEqual({
		isPremium: false,
		isBasic: false,
	});
});

// ─── C. switch / case ─────────────────────────────────────────────────────────
// Currently throws "Template does not match" — switch/case/break are all
// treated as unknown scriptlets and the block structure is never understood.
// Desired: each case is a branch alternative, like if/else if/else.

// ─── 64. Variable extracted from the matching case ───────────────────────────
test("switch/case: extracts variable from the matching case branch", () => {
	const template =
		"<% switch (status) { %>" +
		'<% case "active": %>' +
		'<span class="green"><%= label %></span><% break; %>' +
		'<% case "pending": %>' +
		'<span class="amber"><%= label %></span><% break; %>' +
		'<% case "error": %>' +
		'<span class="red"><%= label %></span><% break; %>' +
		"<% } %>";

	expect(reverseEjs(template, '<span class="green">Running</span>')).toEqual({
		label: "Running",
	});
	expect(reverseEjs(template, '<span class="amber">Waiting</span>')).toEqual({
		label: "Waiting",
	});
	expect(reverseEjs(template, '<span class="red">Failed</span>')).toEqual({
		label: "Failed",
	});
});

// ─── D. Custom delimiters ─────────────────────────────────────────────────────
// Currently throws "Template does not match" — EJS_RE is hardcoded to <, %, >.
// Desired: pass { delimiter, openDelimiter, closeDelimiter } in options and
// the tokenizer builds a matching EJS_RE on the fly.

// ─── 65. Custom delimiter for output and scriptlet tags ──────────────────────
test("custom delimiter: ? produces <? ?> syntax — single variable", () => {
	const template = "<?= name ?>";
	const final = "Alice";
	expect(reverseEjs(template, final, { delimiter: "?" })).toEqual({
		name: "Alice",
	});
});

// ─── 66. Custom delimiter with a forEach loop ────────────────────────────────
test("custom delimiter: forEach loop with ? delimiter", () => {
	const template =
		"<? items.forEach(item => { ?>" + "<li><?= item ?></li>" + "<? }) ?>";
	const final = "<li>Alpha</li><li>Beta</li>";
	expect(reverseEjs(template, final, { delimiter: "?" })).toEqual({
		items: ["Alpha", "Beta"],
	});
});

// ─── 67. Custom open and close delimiters ─────────────────────────────────────
test("custom openDelimiter and closeDelimiter", () => {
	const template = "[%= name %]";
	const final = "Alice";
	expect(
		reverseEjs(template, final, {
			openDelimiter: "[",
			closeDelimiter: "]",
		}),
	).toEqual({ name: "Alice" });
});

// ─── E. for / while / for...in loops ─────────────────────────────────────────
// Currently: these loop headers don't match FOR_EACH_REGEX or FOR_OF_REGEX so
// the loop is not recognised — body variables collapse into flat top-level keys.
// Desired: all three produce an array result just like forEach / for...of.

// ─── 68. Classic for loop ────────────────────────────────────────────────────
test("classic for loop: items extracted as an array", () => {
	const template =
		"<% for (let i = 0; i < names.length; i++) { %>" +
		"<p><%= names[i] %></p>" +
		"<% } %>";
	const final = "<p>Alice</p><p>Bob</p><p>Carol</p>";
	expect(reverseEjs(template, final)).toEqual({
		names: ["Alice", "Bob", "Carol"],
	});
});

// ─── 69. for...in loop ───────────────────────────────────────────────────────
test("for...in: iterates over object keys — keys extracted as an array", () => {
	const template =
		"<% for (const key in config) { %>" + "<li><%= key %></li>" + "<% } %>";
	const final = "<li>host</li><li>port</li><li>debug</li>";
	expect(reverseEjs(template, final)).toEqual({
		config: ["host", "port", "debug"],
	});
});

// ─── 70. while loop ──────────────────────────────────────────────────────────
test("while loop: body variable extracted as an array", () => {
	const template =
		"<% while (items.length) { %>" + "<li><%= item %></li>" + "<% } %>";
	const final = "<li>Alpha</li><li>Beta</li><li>Gamma</li>";
	expect(reverseEjs(template, final)).toEqual({
		items: ["Alpha", "Beta", "Gamma"],
	});
});

// ─── F. Other array-method loops ─────────────────────────────────────────────
// Only .forEach() is currently recognised as a loop keyword.
// Desired: .map() and similar methods that produce repeated output are treated
// the same way — loop body variables extracted as an array.

// ─── 71. .map() loop ─────────────────────────────────────────────────────────
test("map(): treated as a loop — items extracted as an array", () => {
	const template =
		"<% items.map(item => { %>" + "<li><%= item.name %></li>" + "<% }) %>";
	const final = "<li>Alice</li><li>Bob</li>";
	expect(reverseEjs(template, final)).toEqual({
		items: [{ name: "Alice" }, { name: "Bob" }],
	});
});

// ─── 72. Chained .filter().forEach() ─────────────────────────────────────────
test("filter().forEach(): rendered items extracted as an array", () => {
	// The filter condition is lost in the output — only the rendered items remain.
	const template =
		"<% items.filter(i => i.active).forEach(item => { %>" +
		"<li><%= item.name %></li>" +
		"<% }) %>";
	const final = "<li>Alice</li><li>Carol</li>";
	expect(reverseEjs(template, final)).toEqual({
		items: [{ name: "Alice" }, { name: "Carol" }],
	});
});

// ─── G. Adjacent output tags with no literal separator ───────────────────────
// Currently produces silently wrong results (lazy regex takes 1 char for the
// first variable).  Desired: throw a clear, actionable error.

// ─── 73. Adjacent variables throw a descriptive error ────────────────────────
test("adjacent variables with no separator: throws a descriptive error", () => {
	const template = "<%= firstName %><%= lastName %>";
	const final = "AliceSmith";
	expect(() => reverseEjs(template, final)).toThrow(
		"Adjacent variables with no literal separator are ambiguous",
	);
});

// ─── H. locals.varName prefix ────────────────────────────────────────────────
// Currently result key includes the `locals.` prefix, e.g. "locals.title".
// Desired: the prefix is stripped — key becomes "title".

// ─── 74. locals prefix stripped ──────────────────────────────────────────────
test("locals.varName: locals prefix is stripped from result keys", () => {
	const template = "<p><%= locals.title %></p><p><%= locals.author %></p>";
	const final = "<p>My Page</p><p>Alice</p>";
	expect(reverseEjs(template, final)).toEqual({
		title: "My Page",
		author: "Alice",
	});
});

// ─── I. rmWhitespace option ──────────────────────────────────────────────────
// Currently throws "Template does not match" when the output was rendered with
// rmWhitespace:true because the template has indentation the output lacks.
// Desired: accept { rmWhitespace: true } in options and apply the same
// stripping EJS does before tokenising.

// ─── 75. rmWhitespace: true ──────────────────────────────────────────────────
test("rmWhitespace: template with indentation matches output produced by rmWhitespace:true", () => {
	const template = "  <div>\n" + "    <%= name %>\n" + "  </div>";
	// EJS with rmWhitespace:true strips leading/trailing whitespace from each
	// template line then renders normally.  Literal \n between tags are still
	// part of the output — so the rendered string has newlines around the value.
	const final = "<div>\nAlice\n</div>";
	expect(reverseEjs(template, final, { rmWhitespace: true })).toEqual({
		name: "Alice",
	});
});

// ─── J. Custom escape / unescape function ────────────────────────────────────
// Our unescapeHtml() only handles the five standard HTML entities (&amp; etc.).
// If the template was rendered with a custom escape function that produces
// different encodings (e.g. decimal numeric references) extraction fails silently.
// Desired: accept { unescape: fn } in options and apply it instead.

// ─── 76. Custom unescape function ────────────────────────────────────────────
test("custom unescape: applies provided function instead of built-in HTML entity map", () => {
	const template = "<p><%= content %></p>";
	// This output was produced by a custom escape using decimal numeric references.
	const final = "<p>&#60;b&#62;bold&#60;/b&#62;</p>";
	const unescape = (s: string) =>
		s.replace(/&#(\d+);/g, (_: string, code: string) =>
			String.fromCharCode(Number(code)),
		);
	expect(reverseEjs(template, final, { unescape })).toEqual({
		content: "<b>bold</b>",
	});
});

// ─── K. include with a variable filename ─────────────────────────────────────
// Our INCLUDE_RE requires a quoted string literal.  A dynamic filename like
// include(headerPath) currently causes "Invalid capture group name" because the
// whole expression is treated as a variable name.
// Desired: throw a clear, actionable error.

// ─── 77. Dynamic include filename ────────────────────────────────────────────
test("include: dynamic filename (variable) throws a descriptive error", () => {
	const template = "<%- include(headerPath) %><main><%= body %></main>";
	const final = "<header>Nav</header><main>Content</main>";
	expect(() =>
		reverseEjs(template, final, {
			partials: { header: "<header>Nav</header>" },
		}),
	).toThrow("Dynamic include filenames are not supported");
});
