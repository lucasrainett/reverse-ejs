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
});
