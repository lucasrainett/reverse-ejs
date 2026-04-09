import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("loops", () => {
	it("should extract a simple string array with forEach", () => {
		const template =
			"<% items.forEach(item => { %><li><%= item %></li><% }) %>";
		const final = "<li>Apple</li><li>Banana</li><li>Cherry</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Apple", "Banana", "Cherry"],
		});
	});

	it("should extract an object array with forEach", () => {
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

	it("should extract variables and a loop together", () => {
		const template =
			"<h1><%= title %></h1><% items.forEach(item => { %><li><%= item %></li><% }) %>";
		const final = "<h1>Shopping List</h1><li>Apple</li><li>Banana</li>";
		expect(reverseEjs(template, final)).toEqual({
			title: "Shopping List",
			items: ["Apple", "Banana"],
		});
	});

	it("should return an empty array for zero iterations", () => {
		const template =
			"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>";
		const final = "<ul></ul>";
		expect(reverseEjs(template, final)).toEqual({ items: [] });
	});

	it("should handle a loop with exactly one iteration", () => {
		const template =
			"<% items.forEach(item => { %><li><%= item %></li><% }) %>";
		const final = "<li>OnlyItem</li>";
		expect(reverseEjs(template, final)).toEqual({ items: ["OnlyItem"] });
	});

	it("should extract two independent loops at the same level", () => {
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

	it("should extract loop items with four properties each", () => {
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

	it("should extract variables surrounding a loop on both sides", () => {
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

	it("should extract nested departments and members (README example)", () => {
		const template =
			"<% departments.forEach(dept => { %>" +
			"<h2><%= dept.name %></h2>" +
			"<% dept.members.forEach(m => { %><li><%= m.name %></li><% }) %>" +
			"<% }) %>";
		const final =
			"<h2>Engineering</h2><li>Alice</li><li>Bob</li>" +
			"<h2>Design</h2><li>Carol</li>";
		expect(reverseEjs(template, final)).toEqual({
			departments: [
				{
					name: "Engineering",
					members: [{ name: "Alice" }, { name: "Bob" }],
				},
				{
					name: "Design",
					members: [{ name: "Carol" }],
				},
			],
		});
	});

	it("should parse CSV-style plain text from a loop", () => {
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

	it("should extract nested loops", () => {
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

	it("should extract three levels of nested loops", () => {
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

	it("should extract forEach with index in output", () => {
		const template =
			"<% items.forEach((item, i) => { %>" +
			"<li><%= i %>. <%= item %></li>" +
			"<% }) %>";
		const final = "<li>0. Alpha</li><li>1. Beta</li><li>2. Gamma</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Alpha", "Beta", "Gamma"],
		});
	});

	it("should extract forEach with index in class name alongside properties", () => {
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

	it("should extract for...of with a simple string array", () => {
		const template =
			"<% for (const item of items) { %><li><%= item %></li><% } %>";
		const final = "<li>Alpha</li><li>Beta</li><li>Gamma</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Alpha", "Beta", "Gamma"],
		});
	});

	it("should extract for...of with an object array", () => {
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

	it("should extract a classic for loop as an array", () => {
		const template =
			"<% for (let i = 0; i < names.length; i++) { %>" +
			"<p><%= names[i] %></p>" +
			"<% } %>";
		const final = "<p>Alice</p><p>Bob</p><p>Carol</p>";
		expect(reverseEjs(template, final)).toEqual({
			names: ["Alice", "Bob", "Carol"],
		});
	});

	it("should extract for...in keys as an array", () => {
		const template =
			"<% for (const key in config) { %>" +
			"<li><%= key %></li>" +
			"<% } %>";
		const final = "<li>host</li><li>port</li><li>debug</li>";
		expect(reverseEjs(template, final)).toEqual({
			config: ["host", "port", "debug"],
		});
	});

	it("should extract a while loop as an array", () => {
		const template =
			"<% while (items.length) { %>" + "<li><%= item %></li>" + "<% } %>";
		const final = "<li>Alpha</li><li>Beta</li><li>Gamma</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Alpha", "Beta", "Gamma"],
		});
	});

	it("should extract .map() as a loop", () => {
		const template =
			"<% items.map(item => { %>" +
			"<li><%= item.name %></li>" +
			"<% }) %>";
		const final = "<li>Alice</li><li>Bob</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: [{ name: "Alice" }, { name: "Bob" }],
		});
	});

	it("should extract .filter().forEach() as a loop", () => {
		const template =
			"<% items.filter(i => i.active).forEach(item => { %>" +
			"<li><%= item.name %></li>" +
			"<% }) %>";
		const final = "<li>Alice</li><li>Carol</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: [{ name: "Alice" }, { name: "Carol" }],
		});
	});

	it("should extract arrow function forEach with string array", () => {
		const template =
			"<% features.forEach(feat => { %><li><%= feat %></li><% }) %>";
		const final = "<li>Hot reload</li><li>Type checking</li>";
		expect(reverseEjs(template, final)).toEqual({
			features: ["Hot reload", "Type checking"],
		});
	});

	it("should extract arrow function forEach with object array", () => {
		const template =
			"<% colors.map(color => { %>" +
			'<span style="color:<%= color.hex %>"><%= color.name %></span>' +
			"<% }) %>";
		const final =
			'<span style="color:#dc143c">Crimson</span>' +
			'<span style="color:#008080">Teal</span>';
		expect(reverseEjs(template, final)).toEqual({
			colors: [
				{ name: "Crimson", hex: "#dc143c" },
				{ name: "Teal", hex: "#008080" },
			],
		});
	});

	it("should extract traditional function() forEach syntax", () => {
		const template =
			"<% names.forEach(function(name) { %>" +
			"<li><%= name %></li>" +
			"<% }); %>";
		const final = "<li>Alice</li><li>Bob</li><li>Charlie</li>";
		expect(reverseEjs(template, final)).toEqual({
			names: ["Alice", "Bob", "Charlie"],
		});
	});

	it("should extract loop with deeply nested item properties", () => {
		const template =
			"<% orders.forEach(order => { %>" +
			"<div><%= order.customer.name %> — <%= order.customer.email %> — $<%= order.total %></div>" +
			"<% }) %>";
		const final =
			"<div>Alice — alice@example.com — $150.00</div>" +
			"<div>Bob — bob@example.com — $89.99</div>";
		expect(reverseEjs(template, final)).toEqual({
			orders: [
				{
					customer: { name: "Alice", email: "alice@example.com" },
					total: "150.00",
				},
				{
					customer: { name: "Bob", email: "bob@example.com" },
					total: "89.99",
				},
			],
		});
	});

	it("should extract a loop with a single iteration producing one string", () => {
		const template =
			"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>";
		const final = "<ul><li>Only</li></ul>";
		expect(reverseEjs(template, final)).toEqual({ items: ["Only"] });
	});

	it("should extract two independent loops with different item shapes", () => {
		const template =
			"<% tags.forEach(tag => { %><span><%= tag %></span><% }) %>" +
			"<% users.forEach(user => { %><p><%= user.name %></p><% }) %>";
		const final =
			"<span>js</span><span>ts</span>" + "<p>Alice</p><p>Bob</p>";
		expect(reverseEjs(template, final)).toEqual({
			tags: ["js", "ts"],
			users: [{ name: "Alice" }, { name: "Bob" }],
		});
	});

	it("should extract for...of loop with nested properties", () => {
		const template =
			"<% for (const item of menu) { %>" +
			'<a href="<%= item.url %>"><%= item.label %></a>' +
			"<% } %>";
		const final = '<a href="/">Home</a>' + '<a href="/about">About</a>';
		expect(reverseEjs(template, final)).toEqual({
			menu: [
				{ url: "/", label: "Home" },
				{ url: "/about", label: "About" },
			],
		});
	});
});
