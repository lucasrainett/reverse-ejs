import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("variables", () => {
	it("should extract a single variable", () => {
		const template = "Hello, <%= name %>!";
		const final = "Hello, John!";
		expect(reverseEjs(template, final)).toEqual({ name: "John" });
	});

	it("should extract title and description (README example)", () => {
		const template = "<h1><%= title %></h1><p><%= description %></p>";
		const final = "<h1>My Page</h1><p>Welcome to the site</p>";
		expect(reverseEjs(template, final)).toEqual({
			title: "My Page",
			description: "Welcome to the site",
		});
	});

	it("should extract nested author properties (README example)", () => {
		const template = '<a href="<%= author.url %>"><%= author.name %></a>';
		const final = '<a href="https://example.com">Alice Chen</a>';
		expect(reverseEjs(template, final)).toEqual({
			author: { url: "https://example.com", name: "Alice Chen" },
		});
	});

	it("should extract multiple variables", () => {
		const template = "Hello, <%= firstName %> <%= lastName %>!";
		const final = "Hello, John Doe!";
		expect(reverseEjs(template, final)).toEqual({
			firstName: "John",
			lastName: "Doe",
		});
	});

	it("should handle multiline templates", () => {
		const template =
			"Name: <%= name %>\nAge: <%= age %>\nCity: <%= city %>";
		const final = "Name: John\nAge: 30\nCity: New York";
		expect(reverseEjs(template, final)).toEqual({
			name: "John",
			age: "30",
			city: "New York",
		});
	});

	it("should handle values containing special characters", () => {
		const template = "<p><%= message %></p>";
		const final = "<p>Hello & welcome to <the> party!</p>";
		expect(reverseEjs(template, final)).toEqual({
			message: "Hello & welcome to <the> party!",
		});
	});

	it("should handle a variable referenced multiple times", () => {
		const template = "<title><%= name %></title><h1><%= name %></h1>";
		const final = "<title>John</title><h1>John</h1>";
		expect(reverseEjs(template, final)).toEqual({ name: "John" });
	});

	it("should work with plain text templates", () => {
		const template =
			"Dear <%= name %>, your order <%= orderId %> has shipped.";
		const final = "Dear John, your order #1234 has shipped.";
		expect(reverseEjs(template, final)).toEqual({
			name: "John",
			orderId: "#1234",
		});
	});

	it("should strip locals. prefix from result keys", () => {
		const template =
			"<p><%= locals.title %></p><p><%= locals.author %></p>";
		const final = "<p>My Page</p><p>Alice</p>";
		expect(reverseEjs(template, final)).toEqual({
			title: "My Page",
			author: "Alice",
		});
	});

	it("should throw when the string does not match the template", () => {
		const template = "Hello, <%= name %>!";
		const final = "Goodbye, John!";
		expect(() => reverseEjs(template, final)).toThrow("does not match");
	});

	it("should throw for adjacent variables with no separator", () => {
		const template = "<%= firstName %><%= lastName %>";
		const final = "AliceSmith";
		expect(() => reverseEjs(template, final)).toThrow(
			"Adjacent variables with no literal separator are ambiguous",
		);
	});

	it("should extract deeply nested property access", () => {
		const template =
			"<%= address.street %>, <%= address.city %>, <%= address.state %> <%= address.zip %>";
		const final = "742 Evergreen Terrace, Portland, OR 97201";
		expect(reverseEjs(template, final)).toEqual({
			address: {
				street: "742 Evergreen Terrace",
				city: "Portland",
				state: "OR",
				zip: "97201",
			},
		});
	});

	it("should extract three levels of nested property access", () => {
		const template = "<%= company.ceo.name %> runs <%= company.name %>";
		const final = "Alice Chen runs Acme Corp";
		expect(reverseEjs(template, final)).toEqual({
			company: {
				ceo: { name: "Alice Chen" },
				name: "Acme Corp",
			},
		});
	});

	it("should extract mixed flat and nested variables", () => {
		const template =
			"<h1><%= title %></h1><p>By <%= author.name %> (<%= author.email %>)</p>";
		const final =
			"<h1>My Post</h1><p>By Alice Chen (alice@example.com)</p>";
		expect(reverseEjs(template, final)).toEqual({
			title: "My Post",
			author: {
				name: "Alice Chen",
				email: "alice@example.com",
			},
		});
	});

	it("should extract a variable with numeric value as string", () => {
		const template = "<span>Age: <%= age %>, Score: <%= score %></span>";
		const final = "<span>Age: 28, Score: 99.5</span>";
		expect(reverseEjs(template, final)).toEqual({
			age: "28",
			score: "99.5",
		});
	});

	it("should extract a variable whose value contains newlines", () => {
		const template = "<pre><%= content %></pre>";
		const final = "<pre>line one\nline two\nline three</pre>";
		expect(reverseEjs(template, final)).toEqual({
			content: "line one\nline two\nline three",
		});
	});

	it("should extract a variable whose value is a single character", () => {
		const template = "Grade: <%= grade %>";
		const final = "Grade: A";
		expect(reverseEjs(template, final)).toEqual({ grade: "A" });
	});

	it("should extract a variable whose value is an empty string", () => {
		const template = "[<%= value %>]";
		const final = "[]";
		expect(reverseEjs(template, final)).toEqual({ value: "" });
	});

	it("should extract a variable surrounded by special regex characters", () => {
		const template = "($<%= price %>)";
		const final = "($29.99)";
		expect(reverseEjs(template, final)).toEqual({ price: "29.99" });
	});
});
