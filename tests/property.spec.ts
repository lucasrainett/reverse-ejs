import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import * as ejs from "ejs";
import { reverseEjs } from "../src/index";

// The defining round-trip invariant of the library:
//
//   reverseEjs(t, ejs.render(t, d)) === d   (for every t, d)
//
// These tests hammer it with randomly generated data against a fixed set
// of templates. Each template constrains its values to avoid containing
// the template's literal delimiters (which would create ambiguous
// boundaries the library isn't designed to resolve). For each template,
// fast-check runs many iterations — regressions that only surface on
// unusual inputs get caught here before the README examples do.

// Alphanumeric strings only. Prevents two sources of ambiguity that
// break the round-trip property:
//
//   1) The value itself contains a literal delimiter used in the
//      template (e.g. `" | "`), creating two valid splits.
//
//   2) The value contains an HTML-escapable character (`<`, `>`, `&`,
//      `"`, `'`) whose encoded form contains a delimiter character. E.g.
//      `">"` → `"&gt;"` contains `;`; if the template's next literal is
//      `"; "`, the shortest-capture interpretation gives a split that
//      doesn't match the original data. This is a documented library
//      limitation (see README "Limitations") — any inverter based on
//      non-greedy matching has to pick one interpretation.
//
// Alphanumeric values sidestep both, letting the round-trip property
// hold unconditionally.
function safeAlnum(opts: fc.StringConstraints = {}) {
	return fc
		.stringMatching(/^[a-zA-Z0-9_-]+$/, { minLength: 1, ...opts })
		.filter((s) => s.length > 0);
}

describe("property-based round-trip", () => {
	it("Hello, <%= name %>! round-trips for any alphanumeric name", () => {
		fc.assert(
			fc.property(safeAlnum(), (name) => {
				const t = "Hello, <%= name %>!";
				const rendered = ejs.render(t, { name });
				const extracted = reverseEjs(t, rendered) as { name: string };
				expect(extracted.name).toBe(name);
			}),
		);
	});

	it("three-field template round-trips with distinct separators", () => {
		const g = safeAlnum();
		fc.assert(
			fc.property(g, g, g, (a, b, c) => {
				const t = "<%= a %> | <%= b %>; <%= c %>";
				const rendered = ejs.render(t, { a, b, c });
				expect(reverseEjs(t, rendered)).toEqual({ a, b, c });
			}),
		);
	});

	it("dotted-path variable round-trips into a nested object", () => {
		fc.assert(
			fc.property(safeAlnum(), safeAlnum(), (url, name) => {
				const t = '<a href="<%= author.url %>"><%= author.name %></a>';
				const rendered = ejs.render(t, { author: { url, name } });
				expect(reverseEjs(t, rendered)).toEqual({
					author: { url, name },
				});
			}),
		);
	});

	it("forEach loop of strings round-trips for any item list", () => {
		fc.assert(
			fc.property(
				fc.array(safeAlnum(), { minLength: 0, maxLength: 20 }),
				(items) => {
					const t =
						"<ul><% items.forEach(i => { %><li><%= i %></li><% }) %></ul>";
					const rendered = ejs.render(t, { items });
					expect(reverseEjs(t, rendered)).toEqual({ items });
				},
			),
		);
	});

	it("forEach loop of {name, role} objects round-trips", () => {
		const user = fc.record({ name: safeAlnum(), role: safeAlnum() });
		fc.assert(
			fc.property(
				fc.array(user, { minLength: 1, maxLength: 10 }),
				(users) => {
					const t =
						"<% users.forEach(u => { %><li><%= u.name %>(<%= u.role %>)</li><% }) %>";
					const rendered = ejs.render(t, { users });
					expect(reverseEjs(t, rendered)).toEqual({ users });
				},
			),
		);
	});

	it("numeric coercion round-trips for any integer", () => {
		fc.assert(
			fc.property(
				fc.integer({ min: -1_000_000, max: 1_000_000 }),
				(age) => {
					const t = "Age: <%= age %>";
					const rendered = ejs.render(t, { age });
					const extracted = reverseEjs(t, rendered, {
						types: { age: "number" },
					});
					expect(extracted).toEqual({ age });
				},
			),
		);
	});

	it("boolean coercion round-trips", () => {
		fc.assert(
			fc.property(fc.boolean(), (active) => {
				const t = "Active: <%= active %>";
				const rendered = ejs.render(t, { active });
				const extracted = reverseEjs(t, rendered, {
					types: { active: "boolean" },
				});
				expect(extracted).toEqual({ active });
			}),
		);
	});

	it("safe mode never throws — returns null or a valid object", () => {
		// For ANY random rendered string against a fixed template, safe
		// mode should either match (returning an object) or return null,
		// never throw.
		fc.assert(
			fc.property(fc.string({ maxLength: 200 }), (rendered) => {
				const t = "<p><%= x %></p>";
				// Should not throw under any input.
				const r = reverseEjs(t, rendered, { safe: true });
				expect(r === null || typeof r === "object").toBe(true);
			}),
		);
	});

	it("fast-path and regex-path agree on alphanumeric values", () => {
		// flexibleWhitespace forces the regex path; on templates with no
		// whitespace variation and alphanumeric values, both paths must
		// produce identical output. Excludes whitespace-only values —
		// flexWs legitimately collapses those (different semantic, not a
		// regression).
		fc.assert(
			fc.property(safeAlnum(), safeAlnum(), (title, body) => {
				const t = "<h1><%= title %></h1><p><%= body %></p>";
				const rendered = ejs.render(t, { title, body });
				const fast = reverseEjs(t, rendered);
				const regex = reverseEjs(t, rendered, {
					flexibleWhitespace: true,
				});
				expect(fast).toEqual(regex);
			}),
		);
	});
});
