import { describe, it, expect } from "vitest";
import {
	reverseEjs,
	reverseEjsAll,
	compileTemplate,
	type ExtractedValue,
} from "../src/index";

// Type-level tests for the `ExtractedResult<T>` narrowing. These tests
// care about compile-time types as much as runtime behavior — if the
// generic `types` parameter stops propagating to the return type, the
// annotations below start failing `pnpm typecheck`.
//
// The runtime assertions exist so vitest actually runs the suite; the
// compile-time contract is enforced by tsc via `tsconfig.test.json`.

describe("typed result (types: {...} narrows the return type)", () => {
	it("narrows number fields to number", () => {
		const result = reverseEjs("Age: <%= age %>", "Age: 30", {
			types: { age: "number" },
		});
		// Type check: age is number, not ExtractedValue.
		const age: number = result.age;
		expect(age).toBe(30);
	});

	it("narrows boolean fields to boolean", () => {
		const result = reverseEjs("Active: <%= active %>", "Active: true", {
			types: { active: "boolean" },
		});
		const active: boolean = result.active;
		expect(active).toBe(true);
	});

	it("narrows date fields to Date", () => {
		const result = reverseEjs("D: <%= d %>", "D: 2024-01-15", {
			types: { d: "date" },
		});
		const d: Date = result.d;
		expect(d).toBeInstanceOf(Date);
	});

	it("narrows string fields to string", () => {
		const result = reverseEjs("N: <%= n %>", "N: hello", {
			types: { n: "string" },
		});
		const n: string = result.n;
		expect(n).toBe("hello");
	});

	it("mixes multiple narrowed types in one result", () => {
		const result = reverseEjs(
			"<%= name %>/<%= age %>/<%= active %>",
			"Alice/30/true",
			{
				types: {
					name: "string",
					age: "number",
					active: "boolean",
				},
			},
		);
		const name: string = result.name;
		const age: number = result.age;
		const active: boolean = result.active;
		expect({ name, age, active }).toEqual({
			name: "Alice",
			age: 30,
			active: true,
		});
	});

	it("leaves unknown keys as ExtractedValue when types map is partial", () => {
		const result = reverseEjs("<%= name %>/<%= extra %>", "Alice/bonus", {
			types: { name: "string" },
		});
		const name: string = result.name; // narrowed
		const extra: ExtractedValue = result.extra; // index-signature fallback
		expect({ name, extra }).toEqual({ name: "Alice", extra: "bonus" });
	});

	it("narrows compileTemplate().match() return type", () => {
		const compiled = compileTemplate("Age: <%= age %>", {
			types: { age: "number" },
		});
		const result = compiled.match("Age: 42");
		// match() is always nullable (safe mode or mismatch).
		if (result !== null) {
			const age: number = result.age;
			expect(age).toBe(42);
		}
	});

	it("narrows reverseEjsAll() entries", () => {
		const results = reverseEjsAll("N: <%= n %>", ["N: 1", "N: 2", "N: 3"], {
			types: { n: "number" },
		});
		let sum = 0;
		for (const row of results) {
			if (row !== null) {
				const n: number = row.n;
				sum += n;
			}
		}
		expect(sum).toBe(6);
	});

	it("falls back to ExtractedObject when no types option is passed", () => {
		const result = reverseEjs("<%= x %>", "foo");
		// Without a types map, fields are the broad ExtractedValue union.
		const x: ExtractedValue = result.x;
		expect(x).toBe("foo");
	});

	it("returns null-union when safe: true is set", () => {
		const result = reverseEjs("X: <%= x %>", "mismatched", {
			safe: true,
			types: { x: "string" },
		});
		// Even with a types map, safe mode makes the whole result nullable.
		if (result !== null) {
			const x: string = result.x;
			expect(typeof x).toBe("string");
		} else {
			expect(result).toBeNull();
		}
	});
});
