import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

// Under the unified-capture model, expressions are no longer skipped.
// They are captured with the raw expression text as the key.

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
});
