import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("options", () => {
	it("should support ? as custom delimiter for a single variable", () => {
		const template = "<?= name ?>";
		const final = "Alice";
		expect(reverseEjs(template, final, { delimiter: "?" })).toEqual({
			name: "Alice",
		});
	});

	it("should support ? as custom delimiter with a forEach loop", () => {
		const template =
			"<? items.forEach(item => { ?>" +
			"<li><?= item ?></li>" +
			"<? }) ?>";
		const final = "<li>Alpha</li><li>Beta</li>";
		expect(reverseEjs(template, final, { delimiter: "?" })).toEqual({
			items: ["Alpha", "Beta"],
		});
	});

	it("should support custom openDelimiter and closeDelimiter", () => {
		const template = "[%= name %]";
		const final = "Alice";
		expect(
			reverseEjs(template, final, {
				openDelimiter: "[",
				closeDelimiter: "]",
			}),
		).toEqual({ name: "Alice" });
	});

	it("should match output produced with rmWhitespace:true", () => {
		const template = "  <div>\n" + "    <%= name %>\n" + "  </div>";
		const final = "<div>\nAlice\n</div>";
		expect(reverseEjs(template, final, { rmWhitespace: true })).toEqual({
			name: "Alice",
		});
	});

	it("should support custom delimiter with if/else", () => {
		const template =
			"<? if (active) { ?>" +
			"<span><?= label ?></span>" +
			"<? } else { ?>" +
			"<span>Inactive</span>" +
			"<? } ?>";
		const final = "<span>Running</span>";
		expect(reverseEjs(template, final, { delimiter: "?" })).toEqual({
			label: "Running",
			active: true,
		});
	});

	it("should support custom delimiter with object loop", () => {
		const template =
			"<? users.forEach(u => { ?>" +
			"<li><?= u.name ?> (<?= u.role ?>)</li>" +
			"<? }) ?>";
		const final = "<li>Alice (admin)</li><li>Bob (viewer)</li>";
		expect(reverseEjs(template, final, { delimiter: "?" })).toEqual({
			users: [
				{ name: "Alice", role: "admin" },
				{ name: "Bob", role: "viewer" },
			],
		});
	});

	it("should support all three custom delimiters together", () => {
		const template = "{== name =}";
		const final = "Alice";
		expect(
			reverseEjs(template, final, {
				delimiter: "=",
				openDelimiter: "{",
				closeDelimiter: "}",
			}),
		).toEqual({ name: "Alice" });
	});

	it("should support rmWhitespace with loops", () => {
		const template =
			"  <ul>\n" +
			"    <% items.forEach(item => { %>\n" +
			"      <li><%= item %></li>\n" +
			"    <% }) %>\n" +
			"  </ul>";
		const final = "<ul>\n\n<li>Alpha</li>\n\n<li>Beta</li>\n\n</ul>";
		expect(reverseEjs(template, final, { rmWhitespace: true })).toEqual({
			items: ["Alpha", "Beta"],
		});
	});

	it("should support rmWhitespace with conditionals", () => {
		const template =
			"  <% if (show) { %>\n" +
			"    <p><%= message %></p>\n" +
			"  <% } %>";
		const final = "\n<p>Hello</p>\n";
		expect(reverseEjs(template, final, { rmWhitespace: true })).toEqual({
			message: "Hello",
			show: true,
		});
	});

	it("should match minified HTML against pretty-printed template with flexibleWhitespace", () => {
		const template =
			"<div>\n" +
			"  <h1><%= title %></h1>\n" +
			"  <p><%= body %></p>\n" +
			"</div>";
		const final = "<div><h1>Hello</h1><p>World</p></div>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ title: "Hello", body: "World" });
	});

	it("should match pretty-printed HTML against minified template with flexibleWhitespace", () => {
		const template = "<div><h1><%= title %></h1><p><%= body %></p></div>";
		const final =
			"<div>\n" + "  <h1>Hello</h1>\n" + "  <p>World</p>\n" + "</div>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ title: "Hello", body: "World" });
	});

	it("should match with different indentation levels with flexibleWhitespace", () => {
		const template =
			"<ul>\n" +
			"    <% items.forEach(item => { %>\n" +
			"    <li><%= item %></li>\n" +
			"    <% }) %>\n" +
			"</ul>";
		const final = "<ul><li>Alpha</li><li>Beta</li></ul>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ items: ["Alpha", "Beta"] });
	});

	it("should match extra newlines in rendered output with flexibleWhitespace", () => {
		const template = "<h1><%= title %></h1><p><%= body %></p>";
		const final = "<h1>Hello</h1>\n\n\n<p>World</p>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ title: "Hello", body: "World" });
	});

	it("should preserve non-whitespace literal matching with flexibleWhitespace", () => {
		const template = '<div class="product"><%= name %></div>';
		const final = '<div class="product">Widget</div>';
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ name: "Widget" });
	});

	it("should handle loops with different formatting with flexibleWhitespace", () => {
		const template =
			"<table>\n" +
			"  <% rows.forEach(row => { %>\n" +
			"  <tr>\n" +
			"    <td><%= row.name %></td>\n" +
			"    <td><%= row.value %></td>\n" +
			"  </tr>\n" +
			"  <% }) %>\n" +
			"</table>";
		const final =
			"<table><tr><td>Alice</td><td>100</td></tr><tr><td>Bob</td><td>200</td></tr></table>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({
			rows: [
				{ name: "Alice", value: "100" },
				{ name: "Bob", value: "200" },
			],
		});
	});

	it("should handle conditionals with different formatting with flexibleWhitespace", () => {
		const template =
			"<% if (show) { %>\n" + "  <p><%= message %></p>\n" + "<% } %>";
		const final = "<p>Hello</p>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ message: "Hello", show: true });
	});

	// Combining flexibleWhitespace with type coercion — flexWs forces the
	// regex path; coercion is applied as a post-pass regardless of path.
	it("should apply types coercion when flexibleWhitespace is enabled", () => {
		const template =
			"<div>\n  <h1><%= title %></h1>\n  <p>Count: <%= count %></p>\n</div>";
		const final = "<div><h1>Hi</h1><p>Count: 42</p></div>";
		expect(
			reverseEjs(template, final, {
				flexibleWhitespace: true,
				types: { count: "number" },
			}),
		).toEqual({ title: "Hi", count: 42 });
	});

	// Custom unescape function must be honored on both paths. The fast
	// path and regex path both read `opts.unescape` before falling back
	// to the default HTML unescape.
	it("should apply a custom unescape function", () => {
		// Only handles numeric HTML entities (&#N;) — confirms user's
		// function is used instead of the default.
		const numericOnly = (s: string): string =>
			s.replace(/&#(\d+);/g, (_, c: string) =>
				String.fromCharCode(Number(c)),
			);
		expect(
			reverseEjs("<p><%= x %></p>", "<p>A&#123;B</p>", {
				unescape: numericOnly,
			}),
		).toEqual({ x: "A{B" });
	});

	// Custom delimiters in safe mode — mismatches still surface as null,
	// not as a thrown SyntaxError from the parser.
	it("should return null in safe mode with custom delimiters on mismatch", () => {
		expect(
			reverseEjs("start:[%= x %]:end", "totally different format", {
				openDelimiter: "[",
				closeDelimiter: "]",
				safe: true,
			}),
		).toBeNull();
	});

	// Combining flexibleWhitespace with a nested loop inside a conditional —
	// exercises the regex path (flexWs forces it) under a shape the fast
	// path normally handles.
	it("should handle flexibleWhitespace with a loop inside a conditional", () => {
		const template =
			"<% if (show) { %>\n" +
			"  <ul>\n" +
			"    <% items.forEach(i => { %>\n" +
			"      <li><%= i %></li>\n" +
			"    <% }) %>\n" +
			"  </ul>\n" +
			"<% } %>";
		const final = "<ul><li>a</li><li>b</li></ul>";
		expect(
			reverseEjs(template, final, { flexibleWhitespace: true }),
		).toEqual({ show: true, items: ["a", "b"] });
	});
});
