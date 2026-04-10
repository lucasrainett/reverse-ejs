import { describe, it, expect } from "vitest";
import { reverseEjs, ReverseEjsError } from "../src/index";

// New unified behavior:
//   - Plain variables and dotted paths still produce clean structured keys.
//   - Anything more complex (method calls, arithmetic, ternaries, etc.) gets
//     captured with the raw expression text as the literal key.
//   - Adjacent variables get a joined key ("a + b").
//   - Complex conditions get a boolean keyed by the raw condition text.
//   - Nothing throws and nothing warns for these cases.

describe("raw expression capture", () => {
	it("should capture a method call as the raw expression key", () => {
		const template = "<h1><%= title.toUpperCase() %></h1>";
		const final = "<h1>HELLO</h1>";
		expect(reverseEjs(template, final)).toEqual({
			"title.toUpperCase()": "HELLO",
		});
	});

	it("should capture an arithmetic expression as the raw key", () => {
		const template = "<td><%= price * qty %></td>";
		const final = "<td>30</td>";
		expect(reverseEjs(template, final)).toEqual({
			"price * qty": "30",
		});
	});

	it("should capture a ternary expression as the raw key", () => {
		const template = '<p><%= active ? "Online" : "Offline" %></p>';
		const final = "<p>Online</p>";
		expect(reverseEjs(template, final)).toEqual({
			'active ? "Online" : "Offline"': "Online",
		});
	});

	it("should capture chained method calls as the raw key", () => {
		const template = "<p><%= text.trim().toLowerCase() %></p>";
		const final = "<p>hello</p>";
		expect(reverseEjs(template, final)).toEqual({
			"text.trim().toLowerCase()": "hello",
		});
	});

	it("should capture an array.join() expression as the raw key", () => {
		const template = "<p><%= items.join(', ') %></p>";
		const final = "<p>a, b, c</p>";
		expect(reverseEjs(template, final)).toEqual({
			"items.join(', ')": "a, b, c",
		});
	});

	it("should capture string concatenation as the raw key", () => {
		const template = '<p><%= first + " " + last %></p>';
		const final = "<p>Alice Chen</p>";
		expect(reverseEjs(template, final)).toEqual({
			'first + " " + last': "Alice Chen",
		});
	});

	it("should capture nullish coalescing as the raw key", () => {
		const template = "<%= nickname ?? username %>";
		const final = "alice";
		expect(reverseEjs(template, final)).toEqual({
			"nickname ?? username": "alice",
		});
	});

	it("should capture logical OR as the raw key", () => {
		const template = "<p><%= fallback || name %></p>";
		const final = "<p>Alice</p>";
		expect(reverseEjs(template, final)).toEqual({
			"fallback || name": "Alice",
		});
	});

	it("should capture template literal expression as the raw key", () => {
		const template = "<%= `Hello ${name}` %>";
		const final = "Hello Alice";
		expect(reverseEjs(template, final)).toEqual({
			"`Hello ${name}`": "Hello Alice",
		});
	});

	it("should capture numeric bracket access as the raw key", () => {
		const template = "<p><%= items[0] %></p>";
		const final = "<p>first</p>";
		expect(reverseEjs(template, final)).toEqual({
			"items[0]": "first",
		});
	});

	it("should capture both plain variables and expressions in the same template", () => {
		const template =
			"<h1><%= title.toUpperCase() %></h1>" +
			"<p>By <%= author %></p>" +
			"<span>Total: <%= count * 2 %></span>";
		const final = "<h1>HELLO</h1><p>By Alice</p><span>Total: 10</span>";
		expect(reverseEjs(template, final)).toEqual({
			"title.toUpperCase()": "HELLO",
			author: "Alice",
			"count * 2": "10",
		});
	});

	it("should capture an expression alongside a nested variable", () => {
		const template =
			"<h1><%= user.name %></h1><span><%= price * qty %></span>";
		const final = "<h1>Alice</h1><span>30</span>";
		expect(reverseEjs(template, final)).toEqual({
			user: { name: "Alice" },
			"price * qty": "30",
		});
	});

	it("should normalize whitespace inside expression keys", () => {
		// Different spacings should produce the same key
		const t1 = "<%= price * qty %>";
		const t2 = "<%=  price  *  qty  %>";
		const t3 = "<%= price*qty %>";

		const r1 = reverseEjs(t1, "30");
		const r2 = reverseEjs(t2, "30");
		const r3 = reverseEjs(t3, "30");

		expect(Object.keys(r1)[0]).toBe("price * qty");
		expect(Object.keys(r2)[0]).toBe("price * qty");
		expect(Object.keys(r3)[0]).toBe("price * qty");
	});

	it("should not throw or warn for skipped expressions", () => {
		// Just making sure no exception is raised for any of these.
		expect(() =>
			reverseEjs('<%= active ? "Y" : "N" %>', "Y"),
		).not.toThrow();
		expect(() =>
			reverseEjs("<%= title.toUpperCase() %>", "X"),
		).not.toThrow();
	});

	it("should capture an expression inside a loop body", () => {
		const template =
			"<% products.forEach(p => { %>" +
			"<li><%= p.name %>: <%= p.price * p.qty %></li>" +
			"<% }) %>";
		const final = "<li>Widget: 30</li><li>Gadget: 50</li>";
		// p.name is plain (within loop, becomes "name"); p.price * p.qty is an expression
		const result = reverseEjs(template, final);
		expect(result.products).toBeDefined();
		const products = result.products as Array<Record<string, unknown>>;
		expect(products.length).toBe(2);
		expect(products[0].name).toBe("Widget");
		expect(products[1].name).toBe("Gadget");
		// The expression key should appear in each item; loop item prefix stripped
		// (so "p.price * p.qty" becomes "price * qty" inside each item)
		expect(products[0]["price * qty"]).toBe("30");
		expect(products[1]["price * qty"]).toBe("50");
	});

	it("should capture an expression using raw <%- output", () => {
		const template = "<div><%- content.toUpperCase() %></div>";
		const final = "<div>HELLO</div>";
		expect(reverseEjs(template, final)).toEqual({
			"content.toUpperCase()": "HELLO",
		});
	});
});

describe("adjacent variable capture", () => {
	it("should capture two adjacent variables as a joined key", () => {
		const template = "<%= firstName %><%= lastName %>";
		const final = "AliceSmith";
		expect(reverseEjs(template, final)).toEqual({
			"firstName + lastName": "AliceSmith",
		});
	});

	it("should capture three adjacent variables as a joined key", () => {
		const template = "<%= a %><%= b %><%= c %>";
		const final = "XYZ";
		expect(reverseEjs(template, final)).toEqual({
			"a + b + c": "XYZ",
		});
	});

	it("should capture adjacent variables with surrounding text", () => {
		const template = "Name: <%= firstName %><%= lastName %>!";
		const final = "Name: AliceSmith!";
		expect(reverseEjs(template, final)).toEqual({
			"firstName + lastName": "AliceSmith",
		});
	});

	it("should capture adjacent variables alongside plain variables elsewhere", () => {
		const template =
			"<h1><%= title %></h1><p><%= a %><%= b %></p><span><%= footer %></span>";
		const final = "<h1>Hello</h1><p>AliceSmith</p><span>End</span>";
		expect(reverseEjs(template, final)).toEqual({
			title: "Hello",
			"a + b": "AliceSmith",
			footer: "End",
		});
	});

	it("should capture adjacent variables inside a loop body", () => {
		const template =
			"<% items.forEach(item => { %>" +
			"<li><%= item.first %><%= item.last %></li>" +
			"<% }) %>";
		const final = "<li>AliceSmith</li><li>BobJones</li>";
		const result = reverseEjs(template, final);
		expect(result.items).toBeDefined();
		const items = result.items as Array<Record<string, unknown>>;
		expect(items.length).toBe(2);
		// Loop item prefix stripped
		expect(items[0]["first + last"]).toBe("AliceSmith");
		expect(items[1]["first + last"]).toBe("BobJones");
	});

	it("should capture adjacent dotted variables", () => {
		const template = "<%= user.first %><%= user.last %>";
		const final = "AliceSmith";
		expect(reverseEjs(template, final)).toEqual({
			"user.first + user.last": "AliceSmith",
		});
	});

	it("should not throw for adjacent variables", () => {
		expect(() => reverseEjs("<%= a %><%= b %>", "AliceBob")).not.toThrow();
	});

	it("should not throw a ReverseEjsError for adjacent variables", () => {
		try {
			reverseEjs("<%= x %><%= y %>", "ab");
		} catch (e) {
			expect(e).not.toBeInstanceOf(ReverseEjsError);
		}
	});
});

describe("complex condition capture", () => {
	it("should capture a comparison condition as a boolean", () => {
		const template = "<% if (a > b) { %><p>yes</p><% } %>";
		expect(reverseEjs(template, "<p>yes</p>")).toEqual({
			"a > b": true,
		});
		expect(reverseEjs(template, "")).toEqual({
			"a > b": false,
		});
	});

	it("should capture an equality condition as a boolean", () => {
		const template =
			'<% if (status === "active") { %><p>on</p><% } else { %><p>off</p><% } %>';
		expect(reverseEjs(template, "<p>on</p>")).toEqual({
			'status === "active"': true,
		});
		expect(reverseEjs(template, "<p>off</p>")).toEqual({
			'status === "active"': false,
		});
	});

	it("should capture a logical AND condition as a boolean", () => {
		const template = "<% if (isActive && isVerified) { %><p>ok</p><% } %>";
		expect(reverseEjs(template, "<p>ok</p>")).toEqual({
			"isActive && isVerified": true,
		});
	});

	it("should capture a method call condition as a boolean", () => {
		const template = "<% if (items.length > 0) { %><ul></ul><% } %>";
		expect(reverseEjs(template, "<ul></ul>")).toEqual({
			"items.length > 0": true,
		});
	});

	it("should keep clean keys for plain identifier conditions", () => {
		// Existing behavior unchanged
		const template = "<% if (isAdmin) { %><p>yes</p><% } %>";
		expect(reverseEjs(template, "<p>yes</p>")).toEqual({
			isAdmin: true,
		});
	});

	it("should capture a complex condition alongside a clean one", () => {
		const template =
			"<% if (a > b) { %><p>yes</p><% } %>" +
			"<% if (isActive) { %><span>on</span><% } %>";
		expect(reverseEjs(template, "<p>yes</p><span>on</span>")).toEqual({
			"a > b": true,
			isActive: true,
		});
	});

	it("should capture variables inside a complex-condition branch", () => {
		const template =
			"<% if (count > 0) { %><p>Found <%= count %> items</p><% } %>";
		expect(reverseEjs(template, "<p>Found 5 items</p>")).toEqual({
			"count > 0": true,
			count: "5",
		});
	});

	it("should capture an else-if chain with complex conditions", () => {
		const template =
			'<% if (role === "admin") { %><p>admin</p>' +
			'<% } else if (role === "editor") { %><p>editor</p>' +
			"<% } else { %><p>guest</p><% } %>";

		const r1 = reverseEjs(template, "<p>admin</p>");
		expect(r1['role === "admin"']).toBe(true);

		const r2 = reverseEjs(template, "<p>editor</p>");
		expect(r2['role === "admin"']).toBe(false);
		expect(r2['role === "editor"']).toBe(true);
	});
});
