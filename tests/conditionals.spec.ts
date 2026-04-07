import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("conditionals", () => {
	it("should extract variable when if condition was true", () => {
		const template = "<% if (user) { %><h1><%= user.name %></h1><% } %>";
		const final = "<h1>Alice</h1>";
		expect(reverseEjs(template, final)).toEqual({
			"user.name": "Alice",
			user: true,
		});
	});

	it("should extract from the matching if/else branch", () => {
		const template =
			"<% if (isAdmin) { %>" +
			"<p>Welcome, admin <%= name %>!</p>" +
			"<% } else { %>" +
			"<p>Welcome, <%= name %>!</p>" +
			"<% } %>";
		expect(reverseEjs(template, "<p>Welcome, admin Alice!</p>")).toEqual({
			name: "Alice",
			isAdmin: true,
		});
		expect(reverseEjs(template, "<p>Welcome, Bob!</p>")).toEqual({
			name: "Bob",
			isAdmin: false,
		});
	});

	it("should extract array when if block surrounding a loop was rendered", () => {
		const template =
			"<% if (items.length) { %>" +
			"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>" +
			"<% } %>";
		const final = "<ul><li>Alpha</li><li>Beta</li></ul>";
		expect(reverseEjs(template, final)).toEqual({
			items: ["Alpha", "Beta"],
		});
	});

	it("should handle two independent if/else blocks with literal-only branches", () => {
		const template =
			"<% if (isVerified) { %>✓<% } else { %>✗<% } %> " +
			"<%= username %> " +
			"<% if (isOnline) { %>(online)<% } else { %>(offline)<% } %>";

		expect(reverseEjs(template, "✓ Alice (online)")).toEqual({
			isVerified: true,
			username: "Alice",
			isOnline: true,
		});
		expect(reverseEjs(template, "✗ Bob (offline)")).toEqual({
			isVerified: false,
			username: "Bob",
			isOnline: false,
		});
		expect(reverseEjs(template, "✓ Carol (offline)")).toEqual({
			isVerified: true,
			username: "Carol",
			isOnline: false,
		});
	});

	it("should extract extra variable only when then branch is taken", () => {
		const template =
			"<% if (hasBadge) { %>" +
			'<span class="badge"><%= badge %></span> ' +
			"<% } else { %>" +
			'<span class="no-badge"></span> ' +
			"<% } %>" +
			"<%= name %>";

		expect(
			reverseEjs(template, '<span class="badge">Gold</span> Alice'),
		).toEqual({
			hasBadge: true,
			badge: "Gold",
			name: "Alice",
		});
		expect(
			reverseEjs(template, '<span class="no-badge"></span> Bob'),
		).toEqual({
			hasBadge: false,
			name: "Bob",
		});
	});

	it("should handle nested if/else two levels deep", () => {
		const template =
			"<% if (isLoggedIn) { %>" +
			"<% if (isAdmin) { %>" +
			"<p>Admin: <%= name %></p>" +
			"<% } else { %>" +
			"<p>User: <%= name %></p>" +
			"<% } %>" +
			"<% } else { %>" +
			"<p>Guest</p>" +
			"<% } %>";

		expect(reverseEjs(template, "<p>Admin: Alice</p>")).toEqual({
			isLoggedIn: true,
			isAdmin: true,
			name: "Alice",
		});
		expect(reverseEjs(template, "<p>User: Bob</p>")).toEqual({
			isLoggedIn: true,
			isAdmin: false,
			name: "Bob",
		});
		expect(reverseEjs(template, "<p>Guest</p>")).toEqual({
			isLoggedIn: false,
		});
	});

	it("should not include loop data when else branch runs", () => {
		const template =
			"<% if (hasItems) { %>" +
			"<ul><% items.forEach(item => { %><li><%= item %></li><% }) %></ul>" +
			"<% } else { %>" +
			"<p>No items.</p>" +
			"<% } %>";

		expect(
			reverseEjs(template, "<ul><li>Alpha</li><li>Beta</li></ul>"),
		).toEqual({
			hasItems: true,
			items: ["Alpha", "Beta"],
		});
		expect(reverseEjs(template, "<p>No items.</p>")).toEqual({
			hasItems: false,
		});
	});

	it("should resolve same variable names in both branches to one value each", () => {
		const template =
			"<% if (isPaid) { %>" +
			"<%= firstName %> <%= lastName %> — Premium" +
			"<% } else { %>" +
			"<%= firstName %> <%= lastName %> — Free" +
			"<% } %>";

		expect(reverseEjs(template, "Alice Smith — Premium")).toEqual({
			isPaid: true,
			firstName: "Alice",
			lastName: "Smith",
		});
		expect(reverseEjs(template, "Bob Jones — Free")).toEqual({
			isPaid: false,
			firstName: "Bob",
			lastName: "Jones",
		});
	});

	it("should extract variable from whichever else-if branch matched", () => {
		const template =
			'<% if (role === "admin") { %>' +
			'<p class="admin"><%= name %></p>' +
			'<% } else if (role === "mod") { %>' +
			'<p class="mod"><%= name %></p>' +
			"<% } else { %>" +
			'<p class="user"><%= name %></p>' +
			"<% } %>";

		expect(reverseEjs(template, '<p class="admin">Alice</p>')).toEqual({
			name: "Alice",
		});
		expect(reverseEjs(template, '<p class="mod">Bob</p>')).toEqual({
			name: "Bob",
		});
		expect(reverseEjs(template, '<p class="user">Carol</p>')).toEqual({
			name: "Carol",
		});
	});

	it("should extract simple-identifier conditions as booleans in else-if chain", () => {
		const template =
			"<% if (isPremium) { %>" +
			"<span>Premium</span>" +
			"<% } else if (isBasic) { %>" +
			"<span>Basic</span>" +
			"<% } else { %>" +
			"<span>Free</span>" +
			"<% } %>";

		expect(reverseEjs(template, "<span>Premium</span>")).toEqual({
			isPremium: true,
		});
		expect(reverseEjs(template, "<span>Basic</span>")).toEqual({
			isPremium: false,
			isBasic: true,
		});
		expect(reverseEjs(template, "<span>Free</span>")).toEqual({
			isPremium: false,
			isBasic: false,
		});
	});

	it("should extract variable from the matching switch/case branch", () => {
		const template =
			"<% switch (status) { %>" +
			'<% case "active": %>' +
			'<span class="green"><%= label %></span><% break; %>' +
			'<% case "pending": %>' +
			'<span class="amber"><%= label %></span><% break; %>' +
			'<% case "error": %>' +
			'<span class="red"><%= label %></span><% break; %>' +
			"<% } %>";

		expect(
			reverseEjs(template, '<span class="green">Running</span>'),
		).toEqual({ label: "Running" });
		expect(
			reverseEjs(template, '<span class="amber">Waiting</span>'),
		).toEqual({ label: "Waiting" });
		expect(reverseEjs(template, '<span class="red">Failed</span>')).toEqual(
			{ label: "Failed" },
		);
	});
});
