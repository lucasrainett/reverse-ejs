import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("variables", () => {
	it("should extract a single variable", () => {
		const template = "Hello, <%= name %>!";
		const final = "Hello, John!";
		expect(reverseEjs(template, final)).toEqual({ name: "John" });
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
});
