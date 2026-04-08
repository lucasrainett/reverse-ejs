import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("expressions", () => {
	it("should match ternary anonymously — not added to result", () => {
		const template = '<p><%= active ? "Online" : "Offline" %></p>';
		const final = "<p>Online</p>";
		expect(reverseEjs(template, final)).toEqual({});
	});

	it("should match method call anonymously — not added to result", () => {
		const template = "<h1><%= title.toUpperCase() %></h1>";
		const final = "<h1>HELLO WORLD</h1>";
		expect(reverseEjs(template, final)).toEqual({});
	});

	it("should skip arithmetic but still extract plain variables", () => {
		const template = "<td><%= price * qty %></td><td>$<%= price %></td>";
		const final = "<td>15</td><td>$5</td>";
		expect(reverseEjs(template, final)).toEqual({ price: "5" });
	});

	it("should match bracket access in loop body anonymously", () => {
		const template =
			"<% posts.forEach(post => { %>" +
			"<li><%= post.title %> [<%= post.tags[0] %>]</li>" +
			"<% }) %>";
		const final = "<li>Hello [ejs]</li><li>World [js]</li>";
		expect(reverseEjs(template, final)).toEqual({
			posts: [{ title: "Hello" }, { title: "World" }],
		});
	});

	it("should skip nullish coalescing but extract surrounding plain vars", () => {
		const template = "<%= nickname ?? username %> — <%= username %>";
		const final = "alice — alice";
		expect(reverseEjs(template, final)).toEqual({ username: "alice" });
	});

	it("should skip logical OR expression but extract plain vars", () => {
		const template = "<p><%= fallback || name %></p><p><%= name %></p>";
		const final = "<p>Alice</p><p>Alice</p>";
		expect(reverseEjs(template, final)).toEqual({ name: "Alice" });
	});

	it("should skip template literal expression", () => {
		const template = "<%= `Hello ${name}` %>";
		const final = "Hello Alice";
		expect(reverseEjs(template, final)).toEqual({});
	});

	it("should skip string concatenation expression", () => {
		const template = '<p><%= first + " " + last %></p><p><%= first %></p>';
		const final = "<p>Alice Chen</p><p>Alice</p>";
		expect(reverseEjs(template, final)).toEqual({ first: "Alice" });
	});

	it("should skip array.join() expression", () => {
		const template = "<p><%= items.join(', ') %></p>";
		const final = "<p>a, b, c</p>";
		expect(reverseEjs(template, final)).toEqual({});
	});

	it("should skip chained method calls", () => {
		const template = "<p><%= text.trim().toLowerCase() %></p>";
		const final = "<p>hello</p>";
		expect(reverseEjs(template, final)).toEqual({});
	});

	it("should extract plain variables alongside multiple expressions", () => {
		const template =
			"<h1><%= title.toUpperCase() %></h1>" +
			"<p><%= author %></p>" +
			"<span><%= count * 2 %></span>" +
			"<footer><%= footer %></footer>";
		const final =
			"<h1>HELLO</h1><p>Alice</p><span>10</span><footer>End</footer>";
		expect(reverseEjs(template, final)).toEqual({
			author: "Alice",
			footer: "End",
		});
	});
});
