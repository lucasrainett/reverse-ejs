import { describe, it, expect } from "vitest";
import { reverseEjs } from "../src/index";

describe("complex scenarios", () => {
	it("should parse a realistic email template", () => {
		const template =
			"Dear <%= recipient %>,\n\n" +
			"Your invoice #<%= invoiceId %> for $<%= amount %> is due on <%= dueDate %>.\n\n" +
			"Items:\n" +
			"<% lineItems.forEach(item => { %>" +
			"- <%= item.description %>: $<%= item.cost %>\n" +
			"<% }) %>\n" +
			"Regards,\n<%= sender %>";

		const final =
			"Dear Alice,\n\n" +
			"Your invoice #INV-001 for $150.00 is due on 2024-12-31.\n\n" +
			"Items:\n" +
			"- Widget x2: $50.00\n" +
			"- Shipping: $10.00\n" +
			"- Tax: $14.00\n" +
			"\n" +
			"Regards,\nAcme Corp";

		expect(reverseEjs(template, final)).toEqual({
			recipient: "Alice",
			invoiceId: "INV-001",
			amount: "150.00",
			dueDate: "2024-12-31",
			lineItems: [
				{ description: "Widget x2", cost: "50.00" },
				{ description: "Shipping", cost: "10.00" },
				{ description: "Tax", cost: "14.00" },
			],
			sender: "Acme Corp",
		});
	});

	it("should parse table-like HTML with variables and a loop", () => {
		const template =
			"<table><caption><%= caption %></caption>" +
			"<% rows.forEach(row => { %>" +
			"<tr><td><%= row.id %></td><td><%= row.label %></td><td><%= row.value %></td></tr>" +
			"<% }) %>" +
			'<tfoot><td colspan="3"><%= footer %></td></tfoot></table>';

		const final =
			"<table><caption>Results</caption>" +
			"<tr><td>1</td><td>Alpha</td><td>100</td></tr>" +
			"<tr><td>2</td><td>Beta</td><td>200</td></tr>" +
			"<tr><td>3</td><td>Gamma</td><td>300</td></tr>" +
			'<tfoot><td colspan="3">End of report</td></tfoot></table>';

		expect(reverseEjs(template, final)).toEqual({
			caption: "Results",
			rows: [
				{ id: "1", label: "Alpha", value: "100" },
				{ id: "2", label: "Beta", value: "200" },
				{ id: "3", label: "Gamma", value: "300" },
			],
			footer: "End of report",
		});
	});
});
