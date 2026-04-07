import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("includes", () => {
	it("should extract a variable defined inside a partial", () => {
		const partials = { greeting: "<p>Hello, <%= name %>!</p>" };
		const template = '<%- include("greeting") %>';
		const final = "<p>Hello, Alice!</p>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			name: "Alice",
		});
	});

	it("should merge partial variables with parent template variables", () => {
		const partials = { header: "<h1><%= title %></h1>" };
		const template = '<%- include("header") %><main><%= body %></main>';
		const final = "<h1>My Page</h1><main>Welcome!</main>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			title: "My Page",
			body: "Welcome!",
		});
	});

	it("should fully extract a loop inside a partial", () => {
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

	it("should extract item properties from an object-array loop in a partial", () => {
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

	it("should extract grandchild variables from nested partials", () => {
		const partials = {
			layout: '<header><%- include("nav") %></header><main><%= pageContent %></main>',
			nav: "<nav><%= navTitle %></nav>",
		};
		const template = '<%- include("layout") %>';
		const final =
			"<header><nav>Main Menu</nav></header><main>Our story</main>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			navTitle: "Main Menu",
			pageContent: "Our story",
		});
	});

	it("should enforce consistent variable values when same partial is included twice", () => {
		const partials = {
			divider: '<hr data-style="<%= dividerStyle %>">',
		};
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

	it("should accept both single-quote and double-quote syntax", () => {
		const partials = { footer: "<footer>&copy; <%= year %></footer>" };
		const tDouble = '<%- include("footer") %>';
		const tSingle = "<%- include('footer') %>";
		const final = "<footer>&copy; 2025</footer>";
		expect(reverseEjs(tDouble, final, { partials })).toEqual({
			year: "2025",
		});
		expect(reverseEjs(tSingle, final, { partials })).toEqual({
			year: "2025",
		});
	});

	it("should accept partial names with forward slashes", () => {
		const partials = {
			"partials/hero": "<section><%= heroText %></section>",
		};
		const template = '<%- include("partials/hero") %><p><%= tagline %></p>';
		const final =
			"<section>Save the world</section><p>One line at a time</p>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			heroText: "Save the world",
			tagline: "One line at a time",
		});
	});

	it("should accept locals argument syntax without breaking extraction", () => {
		const partials = {
			card: '<div class="card"><%= cardTitle %></div>',
		};
		const template = '<%- include("card", { cardTitle: title }) %>';
		const final = '<div class="card">Welcome</div>';
		expect(reverseEjs(template, final, { partials })).toEqual({
			cardTitle: "Welcome",
		});
	});

	it("should throw when the referenced partial is absent", () => {
		const template = '<p>Before</p><%- include("missing") %><p>After</p>';
		expect(() =>
			reverseEjs(template, "<p>Before</p>anything<p>After</p>", {
				partials: {},
			}),
		).toThrow('Partial "missing" not found');
	});

	it("should throw for dynamic include filenames", () => {
		const template = "<%- include(headerPath) %><main><%= body %></main>";
		const final = "<header>Nav</header><main>Content</main>";
		expect(() =>
			reverseEjs(template, final, {
				partials: { header: "<header>Nav</header>" },
			}),
		).toThrow("Dynamic include filenames are not supported");
	});

	it("should enforce same value when parent and partial share a variable", () => {
		const partials = {
			banner: "<div><%= username %> - Dashboard</div>",
		};
		const template =
			"<h1>Welcome, <%= username %></h1>" + '<%- include("banner") %>';
		const final = "<h1>Welcome, Alice</h1><div>Alice - Dashboard</div>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			username: "Alice",
		});
	});

	it("should cascade a variable through three levels of partials", () => {
		const partials = {
			layout: '<html><%- include("header") %><body><%- include("content") %></body></html>',
			header: "<head><title><%= siteName %></title></head>",
			content: "<h1><%= siteName %></h1><p><%= description %></p>",
		};
		const template = '<%- include("layout") %>';
		const final =
			"<html><head><title>Acme</title></head><body><h1>Acme</h1><p>We build things</p></body></html>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			siteName: "Acme",
			description: "We build things",
		});
	});

	it("should extract variables from sibling partials at the same level", () => {
		const partials = {
			sidebar: "<aside><%= sidebarTitle %></aside>",
			main: "<article><%= articleBody %></article>",
			footer: "<footer><%= copyright %></footer>",
		};
		const template =
			'<div><%- include("sidebar") %><%- include("main") %></div>' +
			'<%- include("footer") %>';
		const final =
			"<div><aside>Navigation</aside><article>Hello world</article></div>" +
			"<footer>2025 Acme</footer>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			sidebarTitle: "Navigation",
			articleBody: "Hello world",
			copyright: "2025 Acme",
		});
	});

	it("should cascade a shared variable across sibling partials via backreference", () => {
		const partials = {
			header: "<header><%= brandName %> Portal</header>",
			footer: "<footer>&copy; <%= brandName %></footer>",
		};
		const template =
			'<%- include("header") %>' +
			"<main><%= content %></main>" +
			'<%- include("footer") %>';
		const final =
			"<header>Acme Portal</header>" +
			"<main>Welcome</main>" +
			"<footer>&copy; Acme</footer>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			brandName: "Acme",
			content: "Welcome",
		});
	});

	it("should extract from a partial included inside a loop body", () => {
		const partials = {
			"user-card":
				'<div class="card"><%= user.name %> (<%= user.role %>)</div>',
		};
		const template =
			'<% users.forEach(user => { %><%- include("user-card") %><% }) %>';
		const final =
			'<div class="card">Alice (admin)</div>' +
			'<div class="card">Bob (viewer)</div>';
		expect(reverseEjs(template, final, { partials })).toEqual({
			users: [
				{ name: "Alice", role: "admin" },
				{ name: "Bob", role: "viewer" },
			],
		});
	});

	it("should cascade variables through four levels of nesting", () => {
		const partials = {
			app: '<%- include("shell") %>',
			shell: "<div><%= appName %>" + '<%- include("page") %>' + "</div>",
			page: '<main><%- include("widget") %><p><%= pageTitle %></p></main>',
			widget: "<span><%= widgetLabel %></span>",
		};
		const template = '<%- include("app") %>';
		const final =
			"<div>MyApp<main><span>Stats</span><p>Home</p></main></div>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			appName: "MyApp",
			widgetLabel: "Stats",
			pageTitle: "Home",
		});
	});

	it("should extract variables when multiple partials each include the same child", () => {
		const partials = {
			icon: "<i><%= iconName %></i>",
			"btn-save": '<%- include("icon") %> Save',
			"btn-delete": '<%- include("icon") %> Delete',
		};
		const template =
			'<div><%- include("btn-save") %></div>' +
			'<div><%- include("btn-delete") %></div>';
		const final =
			"<div><i>disk</i> Save</div>" + "<div><i>disk</i> Delete</div>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			iconName: "disk",
		});
	});

	it("should extract from a partial that contains a loop with nested includes", () => {
		const partials = {
			"product-row":
				"<td><%= product.name %></td><td>$<%= product.price %></td>",
			"product-table":
				"<table>" +
				"<% products.forEach(product => { %>" +
				'<tr><%- include("product-row") %></tr>' +
				"<% }) %>" +
				"</table>",
		};
		const template =
			"<h1><%= title %></h1>" + '<%- include("product-table") %>';
		const final =
			"<h1>Catalog</h1>" +
			"<table>" +
			"<tr><td>Widget</td><td>$9.99</td></tr>" +
			"<tr><td>Gadget</td><td>$24.99</td></tr>" +
			"</table>";
		expect(reverseEjs(template, final, { partials })).toEqual({
			title: "Catalog",
			products: [
				{ name: "Widget", price: "9.99" },
				{ name: "Gadget", price: "24.99" },
			],
		});
	});
});
