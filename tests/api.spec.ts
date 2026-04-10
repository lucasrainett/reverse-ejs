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

	it("should throw at compile time for adjacent variables", () => {
		expect(() => compileTemplate("<%= a %><%= b %>")).toThrow(
			ReverseEjsError,
		);
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

	it("should include adjacent variable names and position", () => {
		try {
			reverseEjs("Foo <%= a %><%= b %> bar", "Foo something bar");
			expect.fail("should have thrown");
		} catch (e) {
			expect(e).toBeInstanceOf(ReverseEjsError);
			const msg = (e as Error).message;
			expect(msg).toContain('"<%= a %>"');
			expect(msg).toContain('"<%= b %>"');
			expect(msg).toContain("position");
		}
	});
});

describe("expression skipping warnings", () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		warnSpy.mockRestore();
	});

	it("should warn when a method call expression is skipped", () => {
		reverseEjs("<h1><%= title.toUpperCase() %></h1>", "<h1>HELLO</h1>");
		expect(warnSpy).toHaveBeenCalled();
		const call = warnSpy.mock.calls[0][0] as string;
		expect(call).toContain("title.toUpperCase()");
		expect(call).toContain("skipped");
	});

	it("should warn when a ternary expression is skipped", () => {
		reverseEjs('<p><%= active ? "yes" : "no" %></p>', "<p>yes</p>");
		expect(warnSpy).toHaveBeenCalled();
	});

	it("should suppress warnings when silent is true", () => {
		reverseEjs("<h1><%= title.toUpperCase() %></h1>", "<h1>HELLO</h1>", {
			silent: true,
		});
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
});
