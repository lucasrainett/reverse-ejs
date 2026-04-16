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

	it("should unescape single quotes (&#39;)", () => {
		const template = "<p><%= content %></p>";
		const final = "<p>it&#39;s a test</p>";
		expect(reverseEjs(template, final)).toEqual({
			content: "it's a test",
		});
	});

	it("should unescape all five standard entities in one value", () => {
		const template = "<span><%= value %></span>";
		const final =
			"<span>&lt;div class=&quot;x&quot;&gt;A &amp; B&#39;s&lt;/div&gt;</span>";
		expect(reverseEjs(template, final)).toEqual({
			value: '<div class="x">A & B\'s</div>',
		});
	});

	it("should unescape entities in loop item properties", () => {
		const template =
			"<% rows.forEach(row => { %><td><%= row.name %></td><td><%= row.note %></td><% }) %>";
		const final =
			"<td>O&#39;Brien</td><td>R &amp; D</td>" +
			"<td>Li &lt;test&gt;</td><td>&quot;quoted&quot;</td>";
		expect(reverseEjs(template, final)).toEqual({
			rows: [
				{ name: "O'Brien", note: "R & D" },
				{ name: "Li <test>", note: '"quoted"' },
			],
		});
	});

	it("should not unescape raw <%- output", () => {
		const template = "<div><%- html %></div>";
		const final = "<div>&lt;b&gt;bold&lt;/b&gt;</div>";
		expect(reverseEjs(template, final)).toEqual({
			html: "&lt;b&gt;bold&lt;/b&gt;",
		});
	});

	// The built-in unescape handles the EJS numeric entity `&#34;` (used
	// for `"`) alongside the named entities. Unknown numeric entities
	// pass through unchanged — the user must supply a custom unescape if
	// they need broader coverage.
	it("should unescape the numeric quote entity &#34;", () => {
		expect(reverseEjs("<p><%= x %></p>", "<p>A&#34;B</p>")).toEqual({
			x: 'A"B',
		});
	});

	it("should pass through unknown numeric entities unchanged by default", () => {
		// &#65; is "A" in HTML but not in the default unescape map. The
		// library returns the raw entity — users wanting broader coverage
		// should pass a custom `unescape`.
		expect(reverseEjs("<p><%= x %></p>", "<p>&#65;B</p>")).toEqual({
			x: "&#65;B",
		});
	});

	it("should not touch values that contain no ampersand (fast-path unescape)", () => {
		// The library skips the entity regex entirely for values with no
		// `&` — this test pins that behavior's correctness for the common
		// non-HTML workload (log lines, CSV fields, plain emails).
		expect(reverseEjs("[<%= x %>]", "[plain text, no entities]")).toEqual({
			x: "plain text, no entities",
		});
	});

	it("should unescape multiple distinct entities in one value", () => {
		expect(
			reverseEjs("<p><%= x %></p>", "<p>&amp;&lt;&gt;&quot;&#39;</p>"),
		).toEqual({ x: "&<>\"'" });
	});
});
