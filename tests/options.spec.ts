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
});
