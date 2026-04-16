import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

// Complex expressions (method calls, arithmetic, ternaries, ...) are
// captured with the raw expression text as the output key — distinct
// from plain variables, which produce a structured dotted-path key.

describe("expressions", () => {
	it("should capture a ternary expression", () => {
		const template = '<p><%= active ? "Online" : "Offline" %></p>';
		const final = "<p>Online</p>";
		expect(reverseEjs(template, final)).toEqual({
			'active ? "Online" : "Offline"': "Online",
		});
	});

	it("should capture a method call expression", () => {
		const template = "<h1><%= title.toUpperCase() %></h1>";
		const final = "<h1>HELLO WORLD</h1>";
		expect(reverseEjs(template, final)).toEqual({
			"title.toUpperCase()": "HELLO WORLD",
		});
	});

	it("should capture an arithmetic expression alongside plain variables", () => {
		const template = "<td><%= price * qty %></td><td>$<%= price %></td>";
		const final = "<td>15</td><td>$5</td>";
		expect(reverseEjs(template, final)).toEqual({
			"price * qty": "15",
			price: "5",
		});
	});

	it("should capture a numeric bracket access in loop body", () => {
		const template =
			"<% posts.forEach(post => { %>" +
			"<li><%= post.title %> [<%= post.tags[0] %>]</li>" +
			"<% }) %>";
		const final = "<li>Hello [ejs]</li><li>World [js]</li>";
		const result = reverseEjs(template, final);
		const posts = result.posts as Array<Record<string, unknown>>;
		expect(posts.length).toBe(2);
		expect(posts[0].title).toBe("Hello");
		expect(posts[0]["tags[0]"]).toBe("ejs");
		expect(posts[1].title).toBe("World");
		expect(posts[1]["tags[0]"]).toBe("js");
	});

	it("should capture nullish coalescing as the raw key", () => {
		const template = "<%= nickname ?? username %> - <%= username %>";
		const final = "alice - alice";
		expect(reverseEjs(template, final)).toEqual({
			"nickname ?? username": "alice",
			username: "alice",
		});
	});

	it("should capture a logical OR expression as the raw key", () => {
		const template = "<p><%= fallback || name %></p><p><%= name %></p>";
		const final = "<p>Alice</p><p>Alice</p>";
		expect(reverseEjs(template, final)).toEqual({
			"fallback || name": "Alice",
			name: "Alice",
		});
	});

	it("should capture a template literal expression as the raw key", () => {
		const template = "<%= `Hello ${name}` %>";
		const final = "Hello Alice";
		expect(reverseEjs(template, final)).toEqual({
			"`Hello ${name}`": "Hello Alice",
		});
	});

	it("should capture string concatenation alongside a plain variable", () => {
		const template = '<p><%= first + " " + last %></p><p><%= first %></p>';
		const final = "<p>Alice Chen</p><p>Alice</p>";
		expect(reverseEjs(template, final)).toEqual({
			'first + " " + last': "Alice Chen",
			first: "Alice",
		});
	});

	it("should capture array.join() expression as the raw key", () => {
		const template = "<p><%= items.join(', ') %></p>";
		const final = "<p>a, b, c</p>";
		expect(reverseEjs(template, final)).toEqual({
			"items.join(', ')": "a, b, c",
		});
	});

	it("should capture chained method calls as the raw key", () => {
		const template = "<p><%= text.trim().toLowerCase() %></p>";
		const final = "<p>hello</p>";
		expect(reverseEjs(template, final)).toEqual({
			"text.trim().toLowerCase()": "hello",
		});
	});

	it("should capture multiple expressions and plain variables together", () => {
		const template =
			"<h1><%= title.toUpperCase() %></h1>" +
			"<p><%= author %></p>" +
			"<span><%= count * 2 %></span>" +
			"<footer><%= footer %></footer>";
		const final =
			"<h1>HELLO</h1><p>Alice</p><span>10</span><footer>End</footer>";
		expect(reverseEjs(template, final)).toEqual({
			"title.toUpperCase()": "HELLO",
			author: "Alice",
			"count * 2": "10",
			footer: "End",
		});
	});

	it("should coerce types on an expression key", () => {
		// The expression text is the key. Supplying a `types` entry under
		// that exact key coerces the value.
		expect(
			reverseEjs("<span><%= count * 2 %></span>", "<span>10</span>", {
				types: { "count * 2": "number" },
			}),
		).toEqual({ "count * 2": 10 });
	});

	it("should capture an expression whose value is empty string", () => {
		expect(reverseEjs("[<%= items.join(',') %>]", "[]")).toEqual({
			"items.join(',')": "",
		});
	});

	it("should capture an expression inside a conditional branch", () => {
		const template = "<% if (show) { %><span><%= a + b %></span><% } %>end";
		expect(reverseEjs(template, "<span>15</span>end")).toEqual({
			show: true,
			"a + b": "15",
		});
	});

	it("should capture an expression inside a loop body", () => {
		const template =
			"<% items.forEach(i => { %><li><%= i.price * i.qty %></li><% }) %>";
		expect(reverseEjs(template, "<li>10</li><li>20</li>")).toEqual({
			items: [{ "price * qty": "10" }, { "price * qty": "20" }],
		});
	});
});
