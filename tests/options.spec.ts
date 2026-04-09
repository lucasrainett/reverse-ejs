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
});
