import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	reverseEjs,
	reverseEjsAll,
	compileTemplate,
	ReverseEjsError,
} from "../src/index";

describe("compileTemplate", () => {
	it("should compile a template once and match multiple strings", () => {
		const compiled = compileTemplate(
			"<%= name %> is <%= age %> years old.",
		);
		expect(compiled.match("Alice is 30 years old.")).toEqual({
			name: "Alice",
			age: "30",
		});
		expect(compiled.match("Bob is 25 years old.")).toEqual({
			name: "Bob",
			age: "25",
		});
	});

	it("should reuse the same regex for multiple matches with loops", () => {
		const compiled = compileTemplate(
			"<% items.forEach(item => { %><li><%= item %></li><% }) %>",
		);
		expect(compiled.match("<li>a</li><li>b</li>")).toEqual({
			items: ["a", "b"],
		});
		expect(compiled.match("<li>x</li><li>y</li><li>z</li>")).toEqual({
			items: ["x", "y", "z"],
		});
	});

	it("should compile adjacent variables and capture them as a joined key", () => {
		const compiled = compileTemplate("<%= a %><%= b %>");
		expect(compiled.match("AliceBob")).toEqual({
			"a + b": "AliceBob",
		});
	});

	it("should throw on match failure by default", () => {
		const compiled = compileTemplate("Hello, <%= name %>!");
		expect(() => compiled.match("Goodbye, John!")).toThrow(ReverseEjsError);
	});

	it("should return null on match failure when safe is true", () => {
		const compiled = compileTemplate("Hello, <%= name %>!", {
			safe: true,
		});
		expect(compiled.match("Goodbye, John!")).toBeNull();
	});
});

// Fast path: walks the pattern's top-level sequence with a cursor over
// the rendered string (no regex at the outer level). Subsumes pure
// literals, capture-only templates, and — via the hybrid walker —
// templates whose loops/conditionals are anchored by literals. Lifts
// the ~40KB literal-in-regex cliff for the shapes users hit in
// practice: product pages, form fields, log lines, plain-text emails,
// HTML pages with a loop or two inside static boilerplate.
describe("fast path (capture-only and hybrid)", () => {
	it("pure-literal: matches an identical string and returns {}", () => {
		const html = '<div class="x">Hello (world).</div>';
		expect(reverseEjs(html, html)).toEqual({});
	});

	it("pure-literal: throws ReverseEjsError on mismatch", () => {
		expect(() => reverseEjs("<p>a</p>", "<p>b</p>")).toThrow(
			ReverseEjsError,
		);
	});

	it("pure-literal: returns null on mismatch when safe is true", () => {
		expect(reverseEjs("<p>a</p>", "<p>b</p>", { safe: true })).toBeNull();
	});

	it("pure-literal: scales to 1MB without hitting the regex cap", () => {
		// ~1MB of literal HTML — would fail regex compilation at ~40KB
		// without the fast path. Unit tests stay at 1MB for speed; the
		// perf sweep covers 10MB+.
		const page = "<article>Body text goes here.</article>\n".repeat(30_000);
		expect(page.length).toBeGreaterThan(1_000_000);
		expect(reverseEjs(page, page)).toEqual({});
	});

	it("single variable with no surrounding literal", () => {
		expect(reverseEjs("<%= x %>", "hello")).toEqual({ x: "hello" });
	});

	it("variable with prefix only", () => {
		expect(reverseEjs("pre:<%= x %>", "pre:hello")).toEqual({ x: "hello" });
	});

	it("variable with suffix only", () => {
		expect(reverseEjs("<%= x %>:end", "hello:end")).toEqual({ x: "hello" });
	});

	it("multiple variables separated by literals", () => {
		expect(
			reverseEjs("<%= a %>|<%= b %>|<%= c %>", "one|two|three"),
		).toEqual({ a: "one", b: "two", c: "three" });
	});

	it("dotted-path variable nests under the path", () => {
		expect(reverseEjs("<%= user.name %>", "Alice")).toEqual({
			user: { name: "Alice" },
		});
	});

	it("expression gets a flat key", () => {
		expect(
			reverseEjs("<h1><%= title.toUpperCase() %></h1>", "<h1>HELLO</h1>"),
		).toEqual({ "title.toUpperCase()": "HELLO" });
	});

	it("raw variable skips HTML unescape", () => {
		expect(reverseEjs("<div><%- x %></div>", "<div>A&amp;B</div>")).toEqual(
			{ x: "A&amp;B" },
		);
	});

	it("non-raw variable applies HTML unescape", () => {
		expect(reverseEjs("<div><%= x %></div>", "<div>A&amp;B</div>")).toEqual(
			{ x: "A&B" },
		);
	});

	it("types coercion still applies", () => {
		expect(
			reverseEjs("Age: <%= age %>", "Age: 30", {
				types: { age: "number" },
			}),
		).toEqual({ age: 30 });
	});

	it("includes the last variable name in the mismatch error", () => {
		try {
			reverseEjs("Hello, <%= name %>!", "Goodbye!");
			expect.fail("should have thrown");
		} catch (e) {
			expect((e as Error).message).toContain('"name"');
			expect((e as ReverseEjsError).details.regex).toContain("Hello");
		}
	});

	it("repeated capture keys defer to the regex path (back-reference preserved)", () => {
		// The regex emits `\k<name>` for the second occurrence — both slots
		// must hold the same value. The walker doesn't have back-refs, so
		// the plan builder refuses and the regex path handles it.
		expect(() =>
			reverseEjs(
				"<title><%= t %></title><h1><%= t %></h1>",
				"<title>HI</title><h1>BYE</h1>",
			),
		).toThrow(ReverseEjsError);
	});

	// Regression: when a captured value contains the delimiter literal,
	// the walker's indexOf picks the first occurrence of the next literal,
	// which may not leave room for the rest of the pattern to match. The
	// regex path backtracks to a later occurrence; the compileTemplate
	// wrapper falls back to regex when the walker returns null so these
	// templates keep matching. See index.ts compileTemplate for the
	// fallback logic.
	it("falls back to regex when walker's first-literal-match doesn't leave room for the rest", () => {
		// With rendered "abaab" and template "<%= x %>a<%= y %>b", the
		// only valid match is x="" and y="baa" (the trailing "b" must
		// anchor at position 4, not the first "b" at position 1).
		expect(reverseEjs("<%= x %>a<%= y %>b", "abaab")).toEqual({
			x: "",
			y: "baa",
		});
	});

	it("falls back to regex for capture containing the next delimiter", () => {
		// Trailing literal "end" appears twice — walker's indexOf would
		// pick the first, leaving "end" as trailing content; regex
		// backtracks to the second occurrence so x = "hello end more".
		expect(reverseEjs("<%= x %>end", "hello end moreend")).toEqual({
			x: "hello end more",
		});
	});

	it("scales to 1MB of literal around a single capture", () => {
		// The shape this increment directly targets: massive literal
		// surrounding a small capture. Previously would fail regex
		// compilation at ~40KB of literal.
		const pad = "<article>Filler paragraph for size.</article>\n".repeat(
			30_000,
		);
		const template = `${pad}<name><%= who %></name>${pad}`;
		const rendered = `${pad}<name>Alice</name>${pad}`;
		expect(template.length).toBeGreaterThan(2_000_000);
		expect(reverseEjs(template, rendered)).toEqual({ who: "Alice" });
	});

	// Hybrid cases — outer walker handles literals/captures, inner regex
	// handles the loop/conditional body on a small sliced section.
	it("loop surrounded by literals", () => {
		expect(
			reverseEjs(
				"<ul><% items.forEach(i => { %><li><%= i %></li><% }) %></ul>",
				"<ul><li>a</li><li>b</li></ul>",
			),
		).toEqual({ items: ["a", "b"] });
	});

	it("loop of objects with two fields", () => {
		expect(
			reverseEjs(
				"<% users.forEach(u => { %><li><%= u.name %>(<%= u.role %>)</li><% }) %>end",
				"<li>A(admin)</li><li>B(user)</li>end",
			),
		).toEqual({
			users: [
				{ name: "A", role: "admin" },
				{ name: "B", role: "user" },
			],
		});
	});

	it("conditional (simple identifier, then matched → true)", () => {
		expect(
			reverseEjs(
				"<% if (admin) { %><em>ADMIN</em><% } %>end",
				"<em>ADMIN</em>end",
			),
		).toEqual({ admin: true });
	});

	it("conditional (simple identifier, then absent → key omitted)", () => {
		// Simple identifiers without an else branch don't emit a boolean
		// key when the branch didn't match — matches the regex path's
		// behavior (complex/dotted conditions do emit false).
		expect(
			reverseEjs("<% if (admin) { %><em>ADMIN</em><% } %>end", "end"),
		).toEqual({});
	});

	it("conditional (complex condition, then absent → false)", () => {
		expect(
			reverseEjs(
				"<% if (user.isAdmin) { %><em>ADMIN</em><% } %>end",
				"end",
			),
		).toEqual({ "user.isAdmin": false });
	});

	it("outer captures combined with an opaque loop (deep-merge under same key)", () => {
		// Outer captures `sidebar.title`; inner loop captures
		// `sidebar.links` as an array. Both must survive — the merge
		// has to be deep, not shallow Object.assign.
		const template =
			"<aside><h2><%= sidebar.title %></h2><ul>" +
			"<% sidebar.links.forEach(link => { %>" +
			'<li><a href="<%= link.url %>"><%= link.label %></a></li>' +
			"<% }) %></ul></aside>";
		const rendered =
			"<aside><h2>Resources</h2><ul>" +
			'<li><a href="/docs">Docs</a></li>' +
			'<li><a href="/api">API</a></li>' +
			"</ul></aside>";
		expect(reverseEjs(template, rendered)).toEqual({
			sidebar: {
				title: "Resources",
				links: [
					{ url: "/docs", label: "Docs" },
					{ url: "/api", label: "API" },
				],
			},
		});
	});

	it("opaque not followed by a literal → falls back to regex path", () => {
		// Two back-to-back loops with no literal between them. The plan
		// builder rejects this (ambiguous boundary), so the regex path
		// handles it. If the regex path ever refuses, the error bubbles
		// up — which is what we want; we're only verifying semantic
		// equivalence here.
		const template =
			"<% as.forEach(a => { %>[<%= a %>]<% }) %>" +
			"<% bs.forEach(b => { %>{<%= b %>}<% }) %>";
		expect(reverseEjs(template, "[x][y]{1}{2}")).toEqual({
			as: ["x", "y"],
			bs: ["1", "2"],
		});
	});

	it("scales to 5MB of literal around a loop", () => {
		// Real-world-ish shape: huge static HTML page wrapping a single
		// dynamic loop. Before the hybrid walker, this would fail at
		// ~40KB of surrounding HTML because the whole template goes
		// into one regex.
		const pad = "<article>Filler paragraph for size.</article>\n".repeat(
			60_000,
		);
		const template =
			pad +
			"<ul><% items.forEach(i => { %><li><%= i %></li><% }) %></ul>" +
			pad;
		const rendered = pad + "<ul><li>a</li><li>b</li><li>c</li></ul>" + pad;
		expect(template.length).toBeGreaterThan(5_000_000);
		expect(reverseEjs(template, rendered)).toEqual({
			items: ["a", "b", "c"],
		});
	});
});

describe("reverseEjs - safe option", () => {
	it("should return null on match failure when safe is true", () => {
		const result = reverseEjs("Hello, <%= name %>!", "Bye!", {
			safe: true,
		});
		expect(result).toBeNull();
	});

	it("should still throw when safe is false (default)", () => {
		expect(() => reverseEjs("Hello, <%= name %>!", "Bye!")).toThrow(
			ReverseEjsError,
		);
	});

	it("should return data normally on success when safe is true", () => {
		const result = reverseEjs("<%= name %>", "Alice", { safe: true });
		expect(result).toEqual({ name: "Alice" });
	});
});

describe("reverseEjs - types coercion", () => {
	it("should coerce string to number", () => {
		expect(
			reverseEjs("Age: <%= age %>", "Age: 30", {
				types: { age: "number" },
			}),
		).toEqual({ age: 30 });
	});

	it("should coerce string to boolean", () => {
		expect(
			reverseEjs(
				"Active: <%= active %>, Verified: <%= verified %>",
				"Active: true, Verified: false",
				{ types: { active: "boolean", verified: "boolean" } },
			),
		).toEqual({ active: true, verified: false });
	});

	it("should coerce string to date", () => {
		const result = reverseEjs("Born: <%= birthday %>", "Born: 1990-01-15", {
			types: { birthday: "date" },
		});
		expect(result.birthday).toBeInstanceOf(Date);
		expect((result.birthday as Date).getFullYear()).toBe(1990);
	});

	it("should keep string as-is for explicit string type", () => {
		expect(
			reverseEjs("ID: <%= id %>", "ID: 42", {
				types: { id: "string" },
			}),
		).toEqual({ id: "42" });
	});

	it("should coerce values inside loop items", () => {
		const result = reverseEjs(
			"<% rows.forEach(row => { %><tr><td><%= row.name %></td><td><%= row.score %></td></tr><% }) %>",
			"<tr><td>Alice</td><td>95</td></tr><tr><td>Bob</td><td>87</td></tr>",
			{ types: { score: "number" } },
		);
		expect(result).toEqual({
			rows: [
				{ name: "Alice", score: 95 },
				{ name: "Bob", score: 87 },
			],
		});
	});

	it("should coerce values nested under a dotted path", () => {
		expect(
			reverseEjs("Age: <%= user.age %>", "Age: 30", {
				types: { age: "number" },
			}),
		).toEqual({ user: { age: 30 } });
	});

	it("should warn and keep original when number coercion fails", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const result = reverseEjs("Age: <%= age %>", "Age: thirty", {
			types: { age: "number" },
		});
		expect(result).toEqual({ age: "thirty" });
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it("should warn and keep original when boolean coercion fails", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const result = reverseEjs("X: <%= x %>", "X: maybe", {
			types: { x: "boolean" },
		});
		expect(result).toEqual({ x: "maybe" });
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it("should warn and keep original when date coercion fails", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const result = reverseEjs("D: <%= d %>", "D: nope", {
			types: { d: "date" },
		});
		expect(result).toEqual({ d: "nope" });
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it("should suppress warnings when silent is true", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		reverseEjs("Age: <%= age %>", "Age: thirty", {
			types: { age: "number" },
			silent: true,
		});
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});
});

describe("ReverseEjsError", () => {
	it("should be an instance of Error", () => {
		const err = new ReverseEjsError("test", { regex: "r", input: "i" });
		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(ReverseEjsError);
	});

	it("should expose details with regex and input", () => {
		try {
			reverseEjs("Hello, <%= name %>!", "Goodbye!");
			expect.fail("should have thrown");
		} catch (e) {
			expect(e).toBeInstanceOf(ReverseEjsError);
			const err = e as ReverseEjsError;
			expect(err.details).toBeDefined();
			expect(err.details.regex).toContain("Hello");
			expect(err.details.input).toBe("Goodbye!");
		}
	});

	it("should mention the variable name in the message", () => {
		try {
			reverseEjs("Hello, <%= name %>!", "Bye!");
			expect.fail("should have thrown");
		} catch (e) {
			expect((e as Error).message).toContain('"name"');
		}
	});

	it("should not throw a ReverseEjsError for adjacent variables", () => {
		// Adjacent variables now get captured as a joined key.
		const result = reverseEjs("Foo <%= a %><%= b %> bar", "Foo XY bar");
		expect(result).toEqual({ "a + b": "XY" });
	});

	it("should name a loop-body variable in the error message", () => {
		const template =
			"<ul><% items.forEach(i => { %><li><%= i.name %></li><% }) %></ul>";
		try {
			reverseEjs(template, "<section>garbage</section>");
			expect.fail("should have thrown");
		} catch (e) {
			// The last variable walked into the loop body is `i.name`.
			expect((e as Error).message).toContain("i.name");
		}
	});

	it("should name a conditional-branch variable in the error message", () => {
		const template = "<% if (isAdmin) { %><h1><%= title %></h1><% } %>";
		try {
			reverseEjs(template, "<h2>nope</h2>");
			expect.fail("should have thrown");
		} catch (e) {
			expect((e as Error).message).toContain("title");
		}
	});

	// The error message used to blame the LAST variable in pattern-tree
	// walk order when a back-reference mismatch was the real cause
	// (e.g. a variable used in both the header and footer partials with
	// different rendered values). Now the diagnostic identifies the
	// actually-inconsistent variable and shows its values.
	it("should name the inconsistent variable (not an innocent one) when a back-reference fails", () => {
		// `name` appears twice; `footerNote` is innocent but used to be
		// named in the error because it's walked last.
		const template =
			"<title><%= name %></title><h1><%= name %></h1><p><%= footerNote %></p>";
		try {
			reverseEjs(
				template,
				"<title>Alice</title><h1>Bob</h1><p>footer</p>",
			);
			expect.fail("should have thrown");
		} catch (e) {
			const msg = (e as Error).message;
			expect(msg).toContain('Variable "name"');
			expect(msg).toContain("inconsistent values");
			expect(msg).toContain("Alice");
			expect(msg).toContain("Bob");
			// footerNote should NOT be blamed.
			expect(msg).not.toContain('"footerNote"');
		}
	});

	it("should diagnose a back-reference mismatch across partial boundaries", () => {
		// Cross-partial repeat of `storeName` is the playground-store
		// repro: change header only, footer still says the old value,
		// error should name `storeName`.
		const partials = {
			header: "<header><h1><%= storeName %></h1></header>",
			footer: "<footer><%= storeName %> &mdash; <%= note %></footer>",
		};
		const template =
			'<%- include("header") %><main><%= body %></main><%- include("footer") %>';
		const rendered =
			"<header><h1>NewStore</h1></header><main>Hi</main><footer>OldStore &mdash; Thanks</footer>";
		try {
			reverseEjs(template, rendered, { partials });
			expect.fail("should have thrown");
		} catch (e) {
			const msg = (e as Error).message;
			expect(msg).toContain('Variable "storeName"');
			expect(msg).toContain("NewStore");
			expect(msg).toContain("OldStore");
			expect(msg).toContain("partial boundaries");
		}
	});
});

describe("expression capture (no warnings)", () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		warnSpy.mockRestore();
	});

	it("should not warn when a method call expression is captured", () => {
		const result = reverseEjs(
			"<h1><%= title.toUpperCase() %></h1>",
			"<h1>HELLO</h1>",
		);
		expect(result).toEqual({ "title.toUpperCase()": "HELLO" });
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it("should not warn when a ternary expression is captured", () => {
		const result = reverseEjs(
			'<p><%= active ? "yes" : "no" %></p>',
			"<p>yes</p>",
		);
		expect(result).toEqual({ 'active ? "yes" : "no"': "yes" });
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it("should not warn for plain variables", () => {
		reverseEjs("<h1><%= title %></h1>", "<h1>Hello</h1>");
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it("should not warn for nested property access", () => {
		reverseEjs("<h1><%= user.name %></h1>", "<h1>Alice</h1>");
		expect(warnSpy).not.toHaveBeenCalled();
	});
});

describe("reverseEjsAll", () => {
	it("should process multiple strings against the same template", () => {
		const results = reverseEjsAll("<%= name %> is <%= age %>", [
			"Alice is 30",
			"Bob is 25",
			"Carol is 40",
		]);
		expect(results).toEqual([
			{ name: "Alice", age: "30" },
			{ name: "Bob", age: "25" },
			{ name: "Carol", age: "40" },
		]);
	});

	it("should apply type coercion to all results", () => {
		const results = reverseEjsAll(
			"<tr><td><%= name %></td><td><%= score %></td></tr>",
			[
				"<tr><td>Alice</td><td>95</td></tr>",
				"<tr><td>Bob</td><td>87</td></tr>",
			],
			{ types: { score: "number" } },
		);
		expect(results).toEqual([
			{ name: "Alice", score: 95 },
			{ name: "Bob", score: 87 },
		]);
	});

	it("should throw on first failure when safe is false", () => {
		expect(() =>
			reverseEjsAll("Hello, <%= name %>!", [
				"Hello, Alice!",
				"Bye!",
				"Hello, Bob!",
			]),
		).toThrow(ReverseEjsError);
	});

	it("should return null entries for failures when safe is true", () => {
		const results = reverseEjsAll(
			"Hello, <%= name %>!",
			["Hello, Alice!", "Bye!", "Hello, Bob!"],
			{ safe: true },
		);
		expect(results).toEqual([{ name: "Alice" }, null, { name: "Bob" }]);
	});

	it("should return empty array for empty input", () => {
		expect(reverseEjsAll("<%= x %>", [])).toEqual([]);
	});

	it("should preserve order even with mixed success/failure in safe mode", () => {
		const results = reverseEjsAll("<%= n %>", ["a", "b", "c"], {
			safe: true,
		});
		expect(results.length).toBe(3);
		expect(results[0]).toEqual({ n: "a" });
	});

	it("should stop and throw on first failure when safe is not set", () => {
		// Without safe:true the first mismatch throws — callers opt into
		// the null-on-failure behavior explicitly.
		expect(() =>
			reverseEjsAll("Hello, <%= name %>!", [
				"Hello, Alice!",
				"NOT HELLO",
				"Hello, Bob!",
			]),
		).toThrow(ReverseEjsError);
	});

	it("should apply types coercion per-row in reverseEjsAll", () => {
		expect(
			reverseEjsAll("Age: <%= age %>", ["Age: 30", "Age: 25"], {
				types: { age: "number" },
			}),
		).toEqual([{ age: 30 }, { age: 25 }]);
	});
});

// These options traverse both the fast path and regex path. The tests
// below pin behavior that depends on fast-path <-> regex-path parity.
describe("fast-path / regex-path parity", () => {
	it("should honor a custom unescape function on the fast path", () => {
		// Numeric-only unescaper — not the default. If the fast path used
		// the default instead of this function, the result would differ.
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

	it("should honor a custom unescape function inside a hybrid loop", () => {
		const numericOnly = (s: string): string =>
			s.replace(/&#(\d+);/g, (_, c: string) =>
				String.fromCharCode(Number(c)),
			);
		expect(
			reverseEjs(
				"<% items.forEach(i => { %><li><%= i %></li><% }) %>",
				"<li>&#65;</li><li>&#66;</li>",
				{ unescape: numericOnly },
			),
		).toEqual({ items: ["A", "B"] });
	});

	it("should capture a very-long value via the fast path", () => {
		// 500KB value inside a capture — would have tripped V8 way before
		// this without the fast path. Confirms the walker just slices
		// without copying until capture, then unescapes once.
		const big = "x".repeat(500_000);
		expect(reverseEjs("pre:<%= v %>:post", `pre:${big}:post`)).toEqual({
			v: big,
		});
	});

	it("should handle a whitespace-only capture value", () => {
		expect(reverseEjs("[<%= x %>]", "[   \n\t  ]")).toEqual({
			x: "   \n\t  ",
		});
	});

	it("should preserve unicode and emoji in a capture", () => {
		expect(reverseEjs("<p><%= x %></p>", "<p>café 你好 😀</p>")).toEqual({
			x: "café 你好 😀",
		});
	});
});

describe("internal pattern cache", () => {
	// The cache is transparent — same template + compile options should
	// always produce equivalent extraction. Different options must not
	// contaminate each other's cached patterns.

	it("returns the same extraction for repeated reverseEjs() calls", () => {
		const t = "<%= name %> is <%= age %>";
		const r1 = reverseEjs(t, "Alice is 30");
		const r2 = reverseEjs(t, "Bob is 25");
		const r3 = reverseEjs(t, "Carol is 40");
		expect(r1).toEqual({ name: "Alice", age: "30" });
		expect(r2).toEqual({ name: "Bob", age: "25" });
		expect(r3).toEqual({ name: "Carol", age: "40" });
	});

	it("does not leak extraction options (safe) across calls", () => {
		// safe is an extraction-time option; it must not be keyed into the cache.
		const t = "<%= name %>";
		const r1 = reverseEjs(t, "X");
		// Same template with safe:true + no match should return null, not throw.
		const r2 = reverseEjs("Hello, <%= name %>!", "nope", { safe: true });
		// Back to a matching call — cache hit should still work correctly.
		const r3 = reverseEjs(t, "Y");
		expect(r1).toEqual({ name: "X" });
		expect(r2).toBeNull();
		expect(r3).toEqual({ name: "Y" });
	});

	it("does not leak extraction options (types) across calls", () => {
		const t = "Age: <%= age %>";
		const asString = reverseEjs(t, "Age: 30");
		const asNumber = reverseEjs(t, "Age: 30", { types: { age: "number" } });
		const asStringAgain = reverseEjs(t, "Age: 30");
		expect(asString).toEqual({ age: "30" });
		expect(asNumber).toEqual({ age: 30 });
		expect(asStringAgain).toEqual({ age: "30" });
	});

	it("keys compile-affecting options into the cache", () => {
		// Same template text but different delimiters → must not return the
		// same cached pattern. Flipping delimiter back should still work.
		const rDefault = reverseEjs("<%= who %>", "Alice");
		const rCustom = reverseEjs("<?= who ?>", "Alice", { delimiter: "?" });
		const rDefaultAgain = reverseEjs("<%= who %>", "Bob");
		expect(rDefault).toEqual({ who: "Alice" });
		expect(rCustom).toEqual({ who: "Alice" });
		expect(rDefaultAgain).toEqual({ who: "Bob" });
	});
});

describe("regression: specific bugs surfaced by external review", () => {
	// Iterating the same array twice in one template used to generate a
	// regex with two `(?<name_LOOP>...)` captures — a duplicate-name
	// syntax error that surfaced as a cryptic "V8 refused" message.
	it("throws a clear error when the same array is iterated twice", () => {
		const tmpl =
			"<ul><% items.forEach(i => { %><li><%= i.name %></li><% }) %></ul>" +
			"<table><% items.forEach(i => { %><tr><td><%= i.sku %></td></tr><% }) %></table>";
		expect(() => reverseEjs(tmpl, "")).toThrow(/iterated more than once/);
	});

	// A top-level `items` array used to be shadowed by a nested `outer.items`
	// loop because `findLoop` suffix-matched first. The top-level loop would
	// match correctly in the regex but then the wrong loop pattern was
	// returned, so extraction came back with `items: []`.
	it("does not shadow a top-level array with a nested suffix-matching one", () => {
		const tmpl =
			"<% outer.items.forEach(x => { %>[<%= x %>]<% }) %>" +
			"|<% items.forEach(y => { %>{<%= y %>}<% }) %>";
		expect(reverseEjs(tmpl, "[a][b]|{c}{d}")).toEqual({
			outer: { items: ["a", "b"] },
			items: ["c", "d"],
		});
	});

	// Dotted-path `if` conditions used to silently drop from the output.
	// Users writing `if (user.isAdmin)` got empty results. Now they produce
	// a boolean under the raw condition text.
	it("emits a boolean key for dotted-path conditions (`if (items.length)`)", () => {
		const tmpl =
			"<% if (items.length) { %><div>yes</div><% } else { %><div>no</div><% } %>";
		expect(reverseEjs(tmpl, "<div>yes</div>")).toEqual({
			"items.length": true,
		});
		expect(reverseEjs(tmpl, "<div>no</div>")).toEqual({
			"items.length": false,
		});
	});

	// Variables with literal `__` used to be decoded as `.` because the
	// library encoded dotted paths that way internally. Now the name map
	// stores the original string directly, so `my__var` stays flat.
	it("treats `my__var` as a flat key, not a nested path", () => {
		expect(reverseEjs("<p><%= my__var %></p>", "<p>hi</p>")).toEqual({
			my__var: "hi",
		});
	});

	it("documents that V8 rejects duplicate named groups (our guard's premise)", () => {
		// Our `assertNoDuplicateGroups` guard exists because V8 would throw
		// an opaque "Invalid regular expression" error with 100+KB of regex
		// dumped into the message. This test pins that premise: if a future
		// engine change ever allowed duplicates, this test would fail first
		// and we'd know the guard is now unnecessary.
		// eslint-disable-next-line no-invalid-regexp
		expect(() => new RegExp("(?<a>x)(?<a>y)")).toThrow();
	});
});

describe("differential: reverseEjs() vs compileTemplate().match() are equivalent", () => {
	const inputs: Array<{ template: string; rendered: string }> = [
		{ template: "Hi <%= name %>", rendered: "Hi Alice" },
		{
			template: "<% items.forEach(i => { %><li><%= i %></li><% }) %>",
			rendered: "<li>a</li><li>b</li>",
		},
		{
			template:
				"<% if (ok) { %><p>yes <%= n %></p><% } else { %><p>no</p><% } %>",
			rendered: "<p>yes 1</p>",
		},
	];
	for (const { template, rendered } of inputs) {
		it(`produces the same object: ${template.slice(0, 40)}`, () => {
			const fresh = reverseEjs(template, rendered);
			const compiled = compileTemplate(template).match(rendered);
			expect(compiled).toEqual(fresh);
		});
	}
});

describe("regex-too-large guard", () => {
	it("throws a friendly ReverseEjsError instead of a V8 SyntaxError", () => {
		// The guard still applies to templates that exercise the regex
		// path (anything with a loop or conditional). Wrap 5000 vars in
		// a conditional so the capture-only fast path defers to regex.
		let inner = "";
		let renderedInner = "";
		for (let i = 0; i < 5000; i++) {
			inner += `<a${i}><%= v${i} %></a${i}>`;
			renderedInner += `<a${i}>val${i}</a${i}>`;
		}
		const template = `<% if (show) { %>${inner}<% } %>`;
		const rendered = renderedInner;
		let thrown: unknown = null;
		try {
			reverseEjs(template, rendered);
		} catch (e) {
			thrown = e;
		}
		expect(thrown).toBeInstanceOf(ReverseEjsError);
		const err = thrown as ReverseEjsError;
		expect(err.message).toMatch(/refused to compile/);
		expect(err.message).toMatch(/partial/i); // remediation mentions partials
	});
});
