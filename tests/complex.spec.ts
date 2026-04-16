import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("complex scenarios", () => {
	it("should parse a realistic email template", () => {
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

	it("should parse table-like HTML with variables and a loop", () => {
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

	it("should parse a blog post page with header, content, tags, and sidebar", () => {
		const template =
			'<article><h1><%= post.title %></h1><span class="author"><%= post.author %></span>' +
			"<div><%- post.content %></div>" +
			'<div class="tags"><% post.tags.forEach(tag => { %><span><%= tag %></span><% }) %></div>' +
			"</article>" +
			"<aside><h2><%= sidebar.title %></h2>" +
			"<ul><% sidebar.links.forEach(link => { %>" +
			'<li><a href="<%= link.url %>"><%= link.label %></a></li>' +
			"<% }) %></ul></aside>";

		const final =
			'<article><h1>Getting Started</h1><span class="author">Alice</span>' +
			"<div><p>Welcome to the <em>guide</em>.</p></div>" +
			'<div class="tags"><span>tutorial</span><span>beginner</span></div>' +
			"</article>" +
			"<aside><h2>Resources</h2>" +
			'<ul><li><a href="/docs">Documentation</a></li>' +
			'<li><a href="/api">API Reference</a></li></ul></aside>';

		expect(reverseEjs(template, final)).toEqual({
			post: {
				title: "Getting Started",
				author: "Alice",
				content: "<p>Welcome to the <em>guide</em>.</p>",
				tags: ["tutorial", "beginner"],
			},
			sidebar: {
				title: "Resources",
				links: [
					{ url: "/docs", label: "Documentation" },
					{ url: "/api", label: "API Reference" },
				],
			},
		});
	});

	it("should parse a user dashboard with conditional sections and nested loops", () => {
		const template =
			"<h1>Dashboard: <%= user.name %></h1>" +
			"<% if (user.isAdmin) { %>" +
			'<div class="admin-panel"><%= adminMessage %></div>' +
			"<% } %>" +
			"<% departments.forEach(dept => { %>" +
			"<section><h2><%= dept.name %></h2><ul>" +
			"<% dept.members.forEach(m => { %>" +
			"<li><%= m.name %> - <%= m.role %></li>" +
			"<% }) %></ul></section>" +
			"<% }) %>" +
			"<footer><%= footerText %></footer>";

		const final =
			"<h1>Dashboard: Alice</h1>" +
			'<div class="admin-panel">System healthy</div>' +
			"<section><h2>Engineering</h2><ul>" +
			"<li>Bob - Lead</li>" +
			"<li>Carol - Senior</li>" +
			"</ul></section>" +
			"<section><h2>Design</h2><ul>" +
			"<li>Dave - Director</li>" +
			"</ul></section>" +
			"<footer>© 2025 Acme</footer>";

		expect(reverseEjs(template, final)).toEqual({
			user: { name: "Alice" },
			// Dotted-path conditions produce a boolean keyed by the raw text.
			"user.isAdmin": true,
			adminMessage: "System healthy",
			departments: [
				{
					name: "Engineering",
					members: [
						{ name: "Bob", role: "Lead" },
						{ name: "Carol", role: "Senior" },
					],
				},
				{
					name: "Design",
					members: [{ name: "Dave", role: "Director" }],
				},
			],
			footerText: "© 2025 Acme",
		});
	});

	it("should parse a product listing with prices, sale flags, and categories", () => {
		const template =
			"<h1><%= storeName %></h1>" +
			"<% products.forEach(p => { %>" +
			'<div class="product">' +
			"<span><%= p.name %></span> - $<%= p.price %>" +
			"<% if (p.onSale) { %> <em>SALE</em><% } %>" +
			"</div>" +
			"<% }) %>" +
			"<p>Showing <%= count %> products</p>";

		const final =
			"<h1>TechShop</h1>" +
			'<div class="product">' +
			"<span>Keyboard</span> - $79.99" +
			"</div>" +
			'<div class="product">' +
			"<span>Monitor</span> - $349.00 <em>SALE</em>" +
			"</div>" +
			"<p>Showing 2 products</p>";

		const result = reverseEjs(template, final);
		expect(result).toEqual({
			storeName: "TechShop",
			products: [
				{ name: "Keyboard", price: "79.99" },
				{ name: "Monitor", price: "349.00" },
			],
			count: "2",
		});
		// Conditions inside loop bodies are not emitted today (per-iteration
		// tracking would be needed). Assert the absence explicitly.
		expect(result).not.toHaveProperty("p.onSale");
	});

	it("should extract product data from HTML (README web extraction example)", () => {
		const template =
			'<div class="product">\n' +
			"  <h1><%= name %></h1>\n" +
			'  <span class="price">$<%= price %></span>\n' +
			'  <p class="description"><%= description %></p>\n' +
			'  <div class="specs">\n' +
			'    <span class="brand"><%= specs.brand %></span>\n' +
			'    <span class="color"><%= specs.color %></span>\n' +
			'    <span class="rating"><%= specs.rating %></span>\n' +
			"  </div>\n" +
			'  <ul class="reviews">\n' +
			"    <% reviews.forEach(review => { %>\n" +
			"    <li>\n" +
			"      <strong><%= review.author %></strong>\n" +
			"      <span><%= review.text %></span>\n" +
			"    </li>\n" +
			"    <% }) %>\n" +
			"  </ul>\n" +
			"</div>";

		const final =
			'<div class="product">\n' +
			"  <h1>Sony WH-1000XM5</h1>\n" +
			'  <span class="price">$348.00</span>\n' +
			'  <p class="description">Industry-leading noise canceling headphones</p>\n' +
			'  <div class="specs">\n' +
			'    <span class="brand">Sony</span>\n' +
			'    <span class="color">Black</span>\n' +
			'    <span class="rating">4.7</span>\n' +
			"  </div>\n" +
			'  <ul class="reviews">\n' +
			"    \n" +
			"    <li>\n" +
			"      <strong>Alice</strong>\n" +
			"      <span>Best headphones I've ever owned. The noise canceling is incredible.</span>\n" +
			"    </li>\n" +
			"    \n" +
			"    <li>\n" +
			"      <strong>Bob</strong>\n" +
			"      <span>Great sound quality, comfortable for long flights.</span>\n" +
			"    </li>\n" +
			"    \n" +
			"  </ul>\n" +
			"</div>";

		expect(reverseEjs(template, final)).toEqual({
			name: "Sony WH-1000XM5",
			price: "348.00",
			description: "Industry-leading noise canceling headphones",
			specs: {
				brand: "Sony",
				color: "Black",
				rating: "4.7",
			},
			reviews: [
				{
					author: "Alice",
					text: "Best headphones I've ever owned. The noise canceling is incredible.",
				},
				{
					author: "Bob",
					text: "Great sound quality, comfortable for long flights.",
				},
			],
		});
	});

	it("should parse a config/settings page with for...in loop", () => {
		const template =
			"<h1><%= pageTitle %></h1>" +
			"<dl><% for (const key in settings) { %>" +
			"<dt><%= key %></dt><dd><%= settings[key] %></dd>" +
			"<% } %></dl>" +
			"<p>Last updated: <%= lastUpdated %></p>";

		const final =
			"<h1>Settings</h1>" +
			"<dl><dt>theme</dt><dd>dark</dd>" +
			"<dt>language</dt><dd>en</dd>" +
			"<dt>timezone</dt><dd>UTC-5</dd></dl>" +
			"<p>Last updated: 2025-01-15</p>";

		expect(reverseEjs(template, final)).toEqual({
			pageTitle: "Settings",
			settings: ["theme", "language", "timezone"],
			lastUpdated: "2025-01-15",
		});
	});

	it("should extract a product page with mixed coercion across scalars and loop items", () => {
		const template =
			"<article>" +
			"<h1><%= product.name %></h1>" +
			"<p class='price'>$<%= product.price %></p>" +
			"<p class='stock'>In stock: <%= product.inStock %></p>" +
			"<ul>" +
			"<% product.features.forEach(f => { %>" +
			"<li><%= f.label %>: <%= f.score %></li>" +
			"<% }) %>" +
			"</ul>" +
			"</article>";
		const final =
			"<article>" +
			"<h1>Widget</h1>" +
			"<p class='price'>$29.99</p>" +
			"<p class='stock'>In stock: true</p>" +
			"<ul>" +
			"<li>Speed: 9</li>" +
			"<li>Finish: 8</li>" +
			"</ul>" +
			"</article>";
		const result = reverseEjs(template, final, {
			types: { price: "number", inStock: "boolean", score: "number" },
		});
		expect(result).toEqual({
			product: {
				name: "Widget",
				price: 29.99,
				inStock: true,
				features: [
					{ label: "Speed", score: 9 },
					{ label: "Finish", score: 8 },
				],
			},
		});
	});

	it("should extract a page with unicode/emoji mixed into structured content", () => {
		const template =
			"<h1><%= title %></h1>" +
			"<% tags.forEach(t => { %><span class='tag'>#<%= t %></span><% }) %>";
		const final =
			"<h1>Café ☕</h1>" +
			"<span class='tag'>#你好</span>" +
			"<span class='tag'>#😀</span>";
		expect(reverseEjs(template, final)).toEqual({
			title: "Café ☕",
			tags: ["你好", "😀"],
		});
	});
});
