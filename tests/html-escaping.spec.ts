import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("HTML escaping", () => {
	it("should unescape HTML entities from <%= output", () => {
		const template = "<p><%= content %></p>";
		const final = "<p>&lt;b&gt;bold&lt;/b&gt;</p>";
		expect(reverseEjs(template, final)).toEqual({ content: "<b>bold</b>" });
	});

	it("should unescape ampersands and quotes", () => {
		const template = '<meta name="desc" content="<%= description %>">';
		const final =
			'<meta name="desc" content="AT&amp;T &quot;wireless&quot;">';
		expect(reverseEjs(template, final)).toEqual({
			description: 'AT&T "wireless"',
		});
	});

	it("should unescape multiple entity types in loop items", () => {
		const template =
			"<% items.forEach(item => { %><li><%= item.label %></li><% }) %>";
		const final =
			"<li>a &lt; b</li><li>x &amp; y</li><li>&quot;quoted&quot;</li>";
		expect(reverseEjs(template, final)).toEqual({
			items: [
				{ label: "a < b" },
				{ label: "x & y" },
				{ label: '"quoted"' },
			],
		});
	});

	it("should apply a custom unescape function instead of built-in", () => {
		const template = "<p><%= content %></p>";
		const final = "<p>&#60;b&#62;bold&#60;/b&#62;</p>";
		const unescape = (s: string) =>
			s.replace(/&#(\d+);/g, (_: string, code: string) =>
				String.fromCharCode(Number(code)),
			);
		expect(reverseEjs(template, final, { unescape })).toEqual({
			content: "<b>bold</b>",
		});
	});
});
