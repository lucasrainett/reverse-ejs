import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("EJS tags", () => {
	it("should ignore EJS comments", () => {
		const template = "<%# page title %>Hello, <%= name %>!<%# end %>";
		const final = "Hello, Alice!";
		expect(reverseEjs(template, final)).toEqual({ name: "Alice" });
	});

	it("should extract a single unescaped variable with <%-", () => {
		const template = "<p><%- content %></p>";
		const final = "<p><b>bold text</b></p>";
		expect(reverseEjs(template, final)).toEqual({
			content: "<b>bold text</b>",
		});
	});

	it("should handle mixed escaped and unescaped variables", () => {
		const template = "<h1><%= title %></h1><div><%- body %></div>";
		const final = "<h1>My Page</h1><div><p>Hello <em>world</em></p></div>";
		expect(reverseEjs(template, final)).toEqual({
			title: "My Page",
			body: "<p>Hello <em>world</em></p>",
		});
	});

	it("should handle <%- raw tag inside a loop", () => {
		const template =
			"<% items.forEach(item => { %><li><%- item.html %></li><% }) %>";
		const final = "<li><b>Alpha</b></li><li><em>Beta</em></li>";
		expect(reverseEjs(template, final)).toEqual({
			items: [{ html: "<b>Alpha</b>" }, { html: "<em>Beta</em>" }],
		});
	});

	it("should treat <%% as literal <% in output", () => {
		const template = "<p>Use <%%> to escape. Value: <%= val %></p>";
		const final = "<p>Use <%> to escape. Value: 42</p>";
		expect(reverseEjs(template, final)).toEqual({ val: "42" });
	});

	it("should handle multiple literal <%% sequences alongside variables", () => {
		const template = "<%% start %%> <%= name %> <%% end %%>";
		const final = "<% start %> Alice <% end %>";
		expect(reverseEjs(template, final)).toEqual({ name: "Alice" });
	});

	it("should trim newline after loop tag with -%>", () => {
		const template =
			"<% items.forEach(item => { -%>\n" +
			"<li><%= item %></li>\n" +
			"<% }) -%>\n";
		const final = "<li>Alpha</li>\n<li>Beta</li>\n";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Alpha", "Beta"],
		});
	});

	it("should slurp newline on variable tag with -%>", () => {
		const template = "Name: <%= name -%>\nAge: <%= age %>";
		const final = "Name: AliceAge: 30";
		expect(reverseEjs(template, final)).toEqual({
			name: "Alice",
			age: "30",
		});
	});

	it("should strip leading whitespace before scriptlet with <%_", () => {
		const template =
			"    <%_ items.forEach(item => { %><li><%= item %></li><%_ }) %>";
		const final = "<li>One</li><li>Two</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["One", "Two"],
		});
	});

	it("should strip trailing whitespace after scriptlet with _%>", () => {
		const template =
			"<% items.forEach(item => { _%>   <li><%= item %></li><% }) %>";
		const final = "<li>One</li><li>Two</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["One", "Two"],
		});
	});

	it("should handle both <%_ and _%> together", () => {
		const template =
			"<%_ items.forEach(item => { _%>" +
			"  <li><%= item %></li>\n" +
			"<%_ }) _%>";
		const final = "<li>Alpha</li>\n<li>Beta</li>\n";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Alpha", "Beta"],
		});
	});

	it("should ignore multiple comments interspersed with content", () => {
		const template =
			"<%# header %><h1><%= title %></h1><%# body %><p><%= body %></p><%# footer %>";
		const final = "<h1>Hello</h1><p>World</p>";
		expect(reverseEjs(template, final)).toEqual({
			title: "Hello",
			body: "World",
		});
	});

	it("should handle -%> trimming between control flow tags", () => {
		const template =
			"<% if (show) { -%>\n" +
			"<p><%= message %></p>\n" +
			"<% } -%>\n" +
			"Done";
		const final = "<p>Hello</p>\nDone";
		expect(reverseEjs(template, final)).toEqual({
			message: "Hello",
			show: true,
		});
	});

	it("should handle <%_ whitespace slurp with conditional", () => {
		const template =
			"<div>    <%_ if (active) { _%>    <span><%= label %></span>    <%_ } _%>    </div>";
		const final = "<div><span>ON</span></div>";
		expect(reverseEjs(template, final)).toEqual({
			label: "ON",
			active: true,
		});
	});
});
