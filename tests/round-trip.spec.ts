import { describe, it, expect } from "vitest";
import * as ejs from "ejs";
import { reverseEjs } from "../src/index";

// The defining property of the library: rendering data through a template
// and then extracting data back should return the original. These tests
// use the actual `ejs` package (not a mental model of it) as the source
// of truth, which is the only way to catch divergences between "what we
// think EJS does" and "what EJS actually does".

interface Case {
	name: string;
	template: string;
	data: Record<string, unknown>;
	// Optional expected output (when not strictly equal to `data` — e.g.
	// numbers come back as strings because the regex captures text).
	expected?: Record<string, unknown>;
}

const CASES: Case[] = [
	{
		name: "single variable",
		template: "Hello, <%= name %>!",
		data: { name: "Alice" },
	},
	{
		name: "multiple variables",
		template: "<h1><%= title %></h1><p>By <%= author %></p>",
		data: { title: "Hello", author: "Alice" },
	},
	{
		name: "nested property access",
		template: '<a href="<%= author.url %>"><%= author.name %></a>',
		data: { author: { url: "https://example.com", name: "Alice" } },
	},
	{
		name: "simple forEach loop of strings",
		template:
			"<ul><% items.forEach(i => { %><li><%= i %></li><% }) %></ul>",
		data: { items: ["a", "b", "c"] },
	},
	{
		name: "forEach loop of objects with two fields",
		template:
			"<% users.forEach(u => { %><li><%= u.name %> (<%= u.role %>)</li><% }) %>",
		data: {
			users: [
				{ name: "Alice", role: "admin" },
				{ name: "Bob", role: "viewer" },
			],
		},
	},
	{
		name: "if/else with bare identifier condition",
		template:
			"<% if (isAdmin) { %><p>Admin <%= name %></p><% } else { %><p>User <%= name %></p><% } %>",
		data: { isAdmin: true, name: "Alice" },
	},
	{
		name: "numeric value (comes back as string)",
		template: "Age: <%= age %>",
		data: { age: 30 },
		expected: { age: "30" },
	},
	{
		name: "HTML entity in value (gets unescaped)",
		template: "<p><%= content %></p>",
		data: { content: 'AT&T "wireless"' },
	},
];

describe("round-trip against real EJS", () => {
	// Rendering with EJS, then extracting back, should return the original
	// data (modulo documented stringification for type-coerced values).
	for (const { name, template, data, expected } of CASES) {
		it(name, () => {
			const rendered = ejs.render(template, data);
			const extracted = reverseEjs(template, rendered);
			expect(extracted).toEqual(expected ?? data);
		});
	}

	// Destructured loop parameters produce correct rendering in EJS but are
	// NOT supported by reverseEjs (silent data corruption otherwise).
	// Explicit error is better than silent wrong data.
	it("rejects destructured loop parameters with a clear error", () => {
		const tmpl =
			"<% users.forEach(({id, name}) => { %><li><%= id %>:<%= name %></li><% }) %>";
		const data = { users: [{ id: 1, name: "a" }] };
		const rendered = ejs.render(tmpl, data);
		// EJS renders it fine…
		expect(rendered).toBe("<li>1:a</li>");
		// …reverseEjs refuses to compile a template it can't reliably extract from.
		expect(() => reverseEjs(tmpl, rendered)).toThrow(
			/Destructured parameters/,
		);
	});
});
