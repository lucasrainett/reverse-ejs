import { test, expect, type Page } from "@playwright/test";
import { resolve } from "node:path";

// ────────────────────────────────────────────────────────────────
// Setup: every test gets a page that
//   1. serves dist/index.global.js for the unpkg CDN URL (so we
//      test against the freshly-built local library, not the
//      version pinned on npm)
//   2. has window.goatcounter stubbed to capture analytics events
//      into window.__events instead of beaconing to gc.zgo.at
// ────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
	await page.route(
		/unpkg\.com\/reverse-ejs@.*\/dist\/index\.global\.js/,
		(route) =>
			route.fulfill({
				path: resolve("dist/index.global.js"),
				contentType: "application/javascript; charset=utf-8",
			}),
	);
	// Block the real GoatCounter script — without this it races our stub and
	// overwrites window.goatcounter with the real implementation, losing all
	// captured events.
	await page.route(/gc\.zgo\.at/, (route) => route.abort());
	await page.addInitScript(() => {
		const w = window as unknown as Record<string, unknown>;
		w.__events = [];
		w.goatcounter = {
			count: (e: unknown) => (w.__events as unknown[]).push(e),
		};
	});
});

// ── Helpers ─────────────────────────────────────────────────────
//
// All selectors use the single `data-testid` pattern so refactors to CSS
// classes, IDs, or DOM structure don't break tests. The map below
// documents every test handle the playground exposes.

const TID = {
	// Editors
	rendered: "rendered-input",
	template: "template-input",
	renderedOverlay: "rendered-overlay",
	templateOverlay: "template-overlay",
	formatBadge: "format-badge",
	// Actions
	extract: "extract-btn",
	reset: "reset-btn",
	copy: "copy-btn",
	optionsToggle: "options-toggle",
	output: "output",
	status: "status",
	// Options panel
	optionsPanel: "options-panel",
	flexWs: "opt-flexWs",
	rmWs: "opt-rmWs",
	safe: "opt-safe",
	silent: "opt-silent",
	autoRun: "opt-autoRun",
	delimiter: "opt-delimiter",
	openDelim: "opt-openDelim",
	closeDelim: "opt-closeDelim",
	partials: "opt-partials",
	types: "opt-types",
	partialsOverlay: "partials-overlay",
	typesOverlay: "types-overlay",
} as const;

async function waitReady(page: Page) {
	// Alpine drops `x-cloak` after init, and the silent default-load
	// fills the output. Once both are true the playground is fully wired.
	await expect(page.locator(".playground")).toBeVisible();
	await expect(page.getByTestId(TID.output)).not.toBeEmpty();
}

async function getEvents(page: Page) {
	return page.evaluate(
		() =>
			(
				window as unknown as {
					__events: { path: string; title: string }[];
				}
			).__events,
	);
}

async function clearEvents(page: Page) {
	await page.evaluate(() => {
		(window as unknown as { __events: unknown[] }).__events = [];
	});
}

async function getOutputJson<T = unknown>(page: Page): Promise<T> {
	const text = await page.getByTestId(TID.output).textContent();
	if (!text) throw new Error("output is empty");
	return JSON.parse(text) as T;
}

// The default-loaded HTML example sets `types`, which auto-opens the Options
// panel. Tests that need a known panel state should call these helpers
// instead of toggling blindly.
async function ensureOptionsOpen(page: Page) {
	const open = await page
		.getByTestId(TID.optionsPanel)
		.evaluate((el) => el.classList.contains("open"));
	if (!open) {
		await page.getByTestId(TID.optionsToggle).click();
		await expect(page.getByTestId(TID.optionsPanel)).toHaveClass(/open/);
	}
}

async function ensureOptionsClosed(page: Page) {
	const open = await page
		.getByTestId(TID.optionsPanel)
		.evaluate((el) => el.classList.contains("open"));
	if (open) {
		await page.getByTestId(TID.optionsToggle).click();
		await expect(page.getByTestId(TID.optionsPanel)).not.toHaveClass(
			/open/,
		);
	}
}

// ────────────────────────────────────────────────────────────────
// 1. Default load on bare URL
// ────────────────────────────────────────────────────────────────

test.describe("Default load", () => {
	test("bare URL silently preloads the HTML example", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		await expect(page.getByTestId(TID.formatBadge)).toHaveText("Html");
		await expect(page.getByTestId(TID.rendered)).toHaveValue(
			/Sony WH-1000XM5/,
		);
		await expect(page.getByTestId(TID.output)).toContainText('"name"');
		await expect(page.getByTestId(TID.status)).toHaveText(
			/Extracted .* keys/,
		);

		// URL stays clean
		expect(new URL(page.url()).search).toBe("");

		// No `example-html` event fired (would inflate analytics on every visit)
		const events = await getEvents(page);
		const paths = events.map((e) => e.path);
		expect(paths).not.toContain("example-html");
		// But `extract-success` (with source `default`) still fires so we know
		// the demo render actually worked.
		expect(paths).toContain("extract-success");
	});
});

// ────────────────────────────────────────────────────────────────
// 2. All 7 example buttons
// ────────────────────────────────────────────────────────────────

const EXAMPLES = [
	{ key: "html", needs: "name" },
	{ key: "markdown", needs: "title" },
	{ key: "log", needs: "lines" },
	{ key: "email", needs: "customer" },
	{ key: "csv", needs: "rows" },
	{ key: "cli", needs: "commits" },
	{ key: "store", needs: "products" },
] as const;

test.describe("Example buttons", () => {
	for (const { key, needs } of EXAMPLES) {
		test(`${key} → loads and extracts`, async ({ page }) => {
			await page.goto("/");
			await waitReady(page);
			await clearEvents(page);

			await page.getByTestId(`example-${key}`).click();

			await expect(page.getByTestId(TID.status)).toHaveText(/Extracted/);
			const result = await getOutputJson<Record<string, unknown>>(page);
			expect(result).toHaveProperty(needs);

			const events = await getEvents(page);
			const paths = events.map((e) => e.path);
			expect(paths).toContain(`example-${key}`);
		});
	}
});

// ────────────────────────────────────────────────────────────────
// 3. Format auto-detection from rendered text
// ────────────────────────────────────────────────────────────────

test.describe("Format auto-detection", () => {
	test("detects log lines and switches the badge", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		await page
			.getByTestId(TID.rendered)
			.fill("[INFO] 2026-04-10T16:58:00Z svc: hi");
		await expect(page.getByTestId(TID.formatBadge)).toHaveText("Log");
	});

	test("detects markdown headings", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.rendered).fill("# Heading\n\nText");
		await expect(page.getByTestId(TID.formatBadge)).toHaveText("Markdown");
	});

	test("detects CSV by comma-separated multiline content", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.rendered).fill("a,1\nb,2\nc,3\n");
		await expect(page.getByTestId(TID.formatBadge)).toHaveText("CSV");
	});
});

// ────────────────────────────────────────────────────────────────
// 4. Options panel
// ────────────────────────────────────────────────────────────────

test.describe("Options panel", () => {
	test("toggles open and closed", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		// The default-loaded HTML example auto-opens the panel because it
		// has `types` set; close it first so this test starts from a known
		// state and exercises both directions.
		await ensureOptionsClosed(page);

		const panel = page.getByTestId(TID.optionsPanel);
		await page.getByTestId(TID.optionsToggle).click();
		await expect(panel).toHaveClass(/open/);

		await page.getByTestId(TID.optionsToggle).click();
		await expect(panel).not.toHaveClass(/open/);
	});

	test("auto-opens when partials are present in restored URL state", async ({
		page,
	}) => {
		const params = new URLSearchParams({
			rendered: "<h1>Hi</h1>",
			template: "<h1><%= title %></h1>",
			partials: '{ "x": "y" }',
		});
		await page.goto(`/?${params.toString()}`);
		await waitReady(page);
		await expect(page.getByTestId(TID.optionsPanel)).toHaveClass(/open/);
	});
});

// ────────────────────────────────────────────────────────────────
// 5. URL state sync
// ────────────────────────────────────────────────────────────────

test.describe("URL state sync", () => {
	test("editing rendered/template writes the URL after debounce", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.template).fill("Hello, <%= name %>!");
		await page.getByTestId(TID.rendered).fill("Hello, Alice!");

		await expect(page).toHaveURL(/rendered=Hello/, { timeout: 2000 });
		await expect(page).toHaveURL(/template=Hello/);
	});

	test("reload restores rendered + template + extracts", async ({ page }) => {
		const params = new URLSearchParams({
			rendered: "Hello, Alice!",
			template: "Hello, <%= name %>!",
		});
		await page.goto(`/?${params.toString()}`);
		await waitReady(page);

		await expect(page.getByTestId(TID.rendered)).toHaveValue(
			"Hello, Alice!",
		);
		await expect(page.getByTestId(TID.template)).toHaveValue(
			"Hello, <%= name %>!",
		);
		expect(await getOutputJson(page)).toEqual({ name: "Alice" });
	});

	test("ALL options + textareas round-trip through the URL", async ({
		page,
	}) => {
		// Step 1: mutate every option + the textareas to non-default values
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);

		await page.getByTestId(TID.flexWs).uncheck(); // default: checked
		await page.getByTestId(TID.rmWs).check();
		await page.getByTestId(TID.safe).check();
		await page.getByTestId(TID.silent).check();
		await page.getByTestId(TID.autoRun).check();
		await page.getByTestId(TID.partials).fill('{ "header": "<h1>X</h1>" }');
		await page.getByTestId(TID.types).fill('{ "name": "string" }');
		await page.getByTestId(TID.template).fill("Hello, <%= name %>!");
		await page.getByTestId(TID.rendered).fill("Hello, Alice!");

		// Wait for the 400ms debounced URL writeback to land all params
		await expect(page).toHaveURL(/flexWs=0/, { timeout: 2000 });
		await expect(page).toHaveURL(/rmWs=1/);
		await expect(page).toHaveURL(/safe=1/);
		await expect(page).toHaveURL(/silent=1/);
		await expect(page).toHaveURL(/autoRun=1/);
		await expect(page).toHaveURL(/partials=/);
		await expect(page).toHaveURL(/types=/);

		// Step 2: capture URL, reload (real browser navigation)
		const restoreUrl = page.url();
		await page.goto(restoreUrl);
		await waitReady(page);

		// Step 3: verify every option came back exactly
		await expect(page.getByTestId(TID.flexWs)).not.toBeChecked();
		await expect(page.getByTestId(TID.rmWs)).toBeChecked();
		await expect(page.getByTestId(TID.safe)).toBeChecked();
		await expect(page.getByTestId(TID.silent)).toBeChecked();
		await expect(page.getByTestId(TID.autoRun)).toBeChecked();
		await expect(page.getByTestId(TID.partials)).toHaveValue(
			/"header": "<h1>X<\/h1>"/,
		);
		await expect(page.getByTestId(TID.types)).toHaveValue(
			/"name": "string"/,
		);
		await expect(page.getByTestId(TID.template)).toHaveValue(
			"Hello, <%= name %>!",
		);
		await expect(page.getByTestId(TID.rendered)).toHaveValue(
			"Hello, Alice!",
		);

		// And the auto-extract (run on URL restore) produced the expected output
		expect(await getOutputJson(page)).toEqual({ name: "Alice" });
	});
});

// ────────────────────────────────────────────────────────────────
// 5b. Shareable example URLs (`?example=KEY`)
// ────────────────────────────────────────────────────────────────

test.describe("Shareable example URLs", () => {
	test("?example=markdown preloads markdown and extracts", async ({
		page,
	}) => {
		await page.goto("/?example=markdown");
		await waitReady(page);

		await expect(page.getByTestId(TID.formatBadge)).toHaveText("Markdown");
		expect(
			await getOutputJson<{ title: string; author: string }>(page),
		).toMatchObject({
			title: "My First Post",
			author: "Alice Chen",
		});

		// URL stays exactly what was navigated to (loadExample saves URL state
		// after running, but the example branch doesn't write rendered/template
		// params back).
		expect(page.url()).toContain("example=markdown");
	});

	test("?example=cli preloads CLI example", async ({ page }) => {
		await page.goto("/?example=cli");
		await waitReady(page);

		await expect(page.getByTestId(TID.formatBadge)).toHaveText("CLI");
		const result = await getOutputJson<{
			commits: { hash: string; message: string }[];
		}>(page);
		expect(result.commits).toHaveLength(3);
		expect(result.commits[0].hash).toBe("abc1234");
	});
});

// ────────────────────────────────────────────────────────────────
// 6. Auto-run
// ────────────────────────────────────────────────────────────────

test.describe("Auto-run", () => {
	test("off → typing does not re-extract", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		const before = await page.getByTestId(TID.output).textContent();

		await page.getByTestId(TID.rendered).fill("Bye, Alice!");
		await page.getByTestId(TID.template).fill("Bye, <%= name %>!");
		// Wait past both the autoRun (300ms) and url save (400ms) timers.
		// We want to assert that no extract happened, which requires waiting
		// the full debounce window — there's no signal we can wait on.
		await page.waitForTimeout(700);

		expect(await page.getByTestId(TID.output).textContent()).toBe(before);
	});

	test("on → typing triggers extract automatically", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);
		await page.getByTestId(TID.autoRun).check();

		await page.getByTestId(TID.template).fill("Hi <%= who %>");
		await page.getByTestId(TID.rendered).fill("Hi World");

		await expect(page.getByTestId(TID.output)).toContainText(
			'"who": "World"',
			{ timeout: 2000 },
		);
	});
});

// ────────────────────────────────────────────────────────────────
// 7. Reset button
// ────────────────────────────────────────────────────────────────

test.describe("Reset", () => {
	test("clears all state, output, and URL", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		// Mutate state first
		await page.getByTestId(TID.template).fill("X<%= y %>");
		await page.getByTestId(TID.rendered).fill("XB");
		await expect(page).toHaveURL(/rendered=XB/, { timeout: 2000 });

		await page.getByTestId(TID.reset).click();

		await expect(page.getByTestId(TID.rendered)).toHaveValue("");
		await expect(page.getByTestId(TID.template)).toHaveValue("");
		await expect(page.getByTestId(TID.output)).toHaveText("");
		await expect(page.getByTestId(TID.formatBadge)).toHaveText("Html");
		await expect(page).toHaveURL(/^[^?]+$/, { timeout: 2000 });
	});
});

// ────────────────────────────────────────────────────────────────
// 8. Copy button
// ────────────────────────────────────────────────────────────────

test.describe("Copy button", () => {
	test("copies extracted JSON to clipboard and flashes label", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.copy).click();

		await expect(page.getByTestId(TID.copy)).toHaveText("Copied!");
		const clip = await page.evaluate(() => navigator.clipboard.readText());
		expect(clip).toContain('"name"');
		expect(clip).toContain("Sony WH-1000XM5");

		// Label snaps back after the timeout
		await expect(page.getByTestId(TID.copy)).toHaveText("Copy", {
			timeout: 2000,
		});
	});

	test("noop when output is empty", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);
		await page.getByTestId(TID.reset).click();
		await clearEvents(page);

		await page.getByTestId(TID.copy).click();

		const events = await getEvents(page);
		expect(events.map((e) => e.path)).toContain("copy-button-empty");
		await expect(page.getByTestId(TID.copy)).toHaveText("Copy");
	});
});

// ────────────────────────────────────────────────────────────────
// 9. Ctrl/Cmd+Enter shortcut
// ────────────────────────────────────────────────────────────────

test.describe("Keyboard shortcut", () => {
	test("Ctrl+Enter from any focus triggers extract", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);
		await clearEvents(page);

		await page.getByTestId(TID.template).focus();
		await page.keyboard.press("Control+Enter");

		const events = await getEvents(page);
		const paths = events.map((e) => e.path);
		expect(paths).toContain("extract-shortcut");
		expect(paths).toContain("extract-success");
	});
});

// ────────────────────────────────────────────────────────────────
// 10. Safe mode
// ────────────────────────────────────────────────────────────────

test.describe("Safe mode", () => {
	test("returns null and shows 'No match' status when no match", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);
		await page.getByTestId(TID.safe).check();

		await page.getByTestId(TID.template).fill("Hello, <%= name %>!");
		await page.getByTestId(TID.rendered).fill("Goodbye!");
		await page.getByTestId(TID.extract).click();

		await expect(page.getByTestId(TID.output)).toHaveText("null");
		await expect(page.getByTestId(TID.status)).toHaveText(/No match/);
		await expect(page.getByTestId(TID.status)).toHaveClass(/err/);
	});
});

// ────────────────────────────────────────────────────────────────
// 11. Error path (template-mismatch without safe mode)
// ────────────────────────────────────────────────────────────────

test.describe("Error path", () => {
	test("shows the error message in the output pane", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.template).fill("Hello, <%= name %>!");
		await page.getByTestId(TID.rendered).fill("Goodbye!");
		await page.getByTestId(TID.extract).click();

		await expect(page.getByTestId(TID.status)).toHaveText("Error");
		await expect(page.getByTestId(TID.status)).toHaveClass(/err/);
		await expect(page.getByTestId(TID.output)).toContainText(
			/Could not match|does not match/,
		);
	});
});

// ────────────────────────────────────────────────────────────────
// 12. Partials JSON validation
// ────────────────────────────────────────────────────────────────

test.describe("Partials JSON validation", () => {
	test("invalid JSON surfaces a clear error", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);
		await page.getByTestId(TID.partials).fill("{ broken");

		await page.getByTestId(TID.template).fill("Hi");
		await page.getByTestId(TID.rendered).fill("Hi");
		await page.getByTestId(TID.extract).click();

		await expect(page.getByTestId(TID.output)).toContainText(
			/Invalid partials JSON/,
		);
		await expect(page.getByTestId(TID.status)).toHaveText("Error");
	});
});

// ────────────────────────────────────────────────────────────────
// 13. Type coercion via the UI
// ────────────────────────────────────────────────────────────────

test.describe("Type coercion", () => {
	test("`types` JSON converts strings to numbers in the output", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);

		await page.getByTestId(TID.types).fill('{ "age": "number" }');
		await page.getByTestId(TID.template).fill("Age: <%= age %>");
		await page.getByTestId(TID.rendered).fill("Age: 30");
		await page.getByTestId(TID.extract).click();

		const result = await getOutputJson<{ age: unknown }>(page);
		expect(result.age).toBe(30); // number, not "30"
	});

	test("`types` JSON converts strings to booleans in the output", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);

		await page.getByTestId(TID.types).fill('{ "active": "boolean" }');
		await page.getByTestId(TID.template).fill("Active: <%= active %>");
		await page.getByTestId(TID.rendered).fill("Active: true");
		await page.getByTestId(TID.extract).click();

		const result = await getOutputJson<{ active: unknown }>(page);
		expect(result.active).toBe(true); // boolean true, not "true"
	});
});

// ────────────────────────────────────────────────────────────────
// 13b. Partials (includes) — happy path
// ────────────────────────────────────────────────────────────────

test.describe("Partials (includes)", () => {
	test("valid partials drive a working `<%- include('name') %>` extraction", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);

		await page
			.getByTestId(TID.partials)
			.fill('{ "header": "<h1><%= title %></h1>" }');
		await page
			.getByTestId(TID.template)
			.fill('<%- include("header") %><p><%= body %></p>');
		await page.getByTestId(TID.rendered).fill("<h1>Hello</h1><p>World</p>");
		await page.getByTestId(TID.extract).click();

		expect(await getOutputJson(page)).toEqual({
			title: "Hello",
			body: "World",
		});
	});
});

// ────────────────────────────────────────────────────────────────
// 13c. v3 capture features (adjacent variables, complex expressions)
// ────────────────────────────────────────────────────────────────

test.describe("v3 capture features", () => {
	test("adjacent variables produce a joined-key capture", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);

		await page
			.getByTestId(TID.template)
			.fill("<%= firstName %><%= lastName %>");
		await page.getByTestId(TID.rendered).fill("AliceSmith");
		await page.getByTestId(TID.extract).click();

		expect(await getOutputJson(page)).toEqual({
			"firstName + lastName": "AliceSmith",
		});
	});
});

// ────────────────────────────────────────────────────────────────
// 13d. Loop array structure assertions
// ────────────────────────────────────────────────────────────────

test.describe("Loop extraction", () => {
	test("HTML reviews loop produces a typed array with all fields", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		// Re-trigger the HTML example explicitly so we're not relying on the
		// silent default-load happening at exactly the right moment.
		await page.getByTestId("example-html").click();
		await expect(page.getByTestId(TID.status)).toHaveText(/Extracted/);

		const result = await getOutputJson<{
			name: string;
			price: number;
			description: string;
			specs: { brand: string; color: string; rating: number };
			reviews: { author: string; text: string }[];
		}>(page);

		expect(result.name).toBe("Sony WH-1000XM5");
		expect(result.price).toBe(348);
		expect(result.specs.brand).toBe("Sony");
		expect(result.specs.color).toBe("Black");
		expect(result.specs.rating).toBe(4.7);
		expect(result.reviews).toHaveLength(2);
		expect(result.reviews[0].author).toBe("Alice");
		expect(result.reviews[0].text).toContain(
			"noise canceling is incredible",
		);
		expect(result.reviews[1].author).toBe("Bob");
		expect(result.reviews[1].text).toContain(
			"comfortable for long flights",
		);
	});
});

// ────────────────────────────────────────────────────────────────
// 14. Highlight overlay sync
// ────────────────────────────────────────────────────────────────

test.describe("Highlight overlay", () => {
	test("rendered overlay shows colored html-tag spans", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.rendered).fill("<h1>Hi</h1>");
		const overlayHtml = await page
			.getByTestId(TID.renderedOverlay)
			.innerHTML();
		expect(overlayHtml).toContain('class="html-tag"');
	});

	test("template overlay shows ejs-tag and ejs-expr spans", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);

		await page.getByTestId(TID.template).fill("<%= name %>");
		const overlayHtml = await page
			.getByTestId(TID.templateOverlay)
			.innerHTML();
		expect(overlayHtml).toContain('class="ejs-tag"');
		expect(overlayHtml).toContain('class="ejs-expr"');
	});

	test("output JSON pre is highlighted", async ({ page }) => {
		await page.goto("/");
		await waitReady(page);

		const html = await page.getByTestId(TID.output).innerHTML();
		expect(html).toContain('class="json-key"');
		expect(html).toContain('class="json-bracket"');
	});
});

// ────────────────────────────────────────────────────────────────
// 15. Custom delimiters
// ────────────────────────────────────────────────────────────────

test.describe("Custom delimiters", () => {
	test("delimiter=? changes how `<?= name ?>` is parsed", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);

		await page.getByTestId(TID.delimiter).fill("?");
		await page.getByTestId(TID.template).fill("Hi <?= who ?>");
		await page.getByTestId(TID.rendered).fill("Hi World");
		await page.getByTestId(TID.extract).click();

		expect(await getOutputJson(page)).toEqual({ who: "World" });
	});

	test("openDelimiter+closeDelimiter accept square brackets", async ({
		page,
	}) => {
		await page.goto("/");
		await waitReady(page);
		await ensureOptionsOpen(page);

		await page.getByTestId(TID.openDelim).fill("[");
		await page.getByTestId(TID.closeDelim).fill("]");
		await page.getByTestId(TID.template).fill("Hi [%= who %]");
		await page.getByTestId(TID.rendered).fill("Hi World");
		// flexibleWhitespace can interfere; turn it off for exact-string match
		await page.getByTestId(TID.flexWs).uncheck();
		await page.getByTestId(TID.extract).click();

		expect(await getOutputJson(page)).toEqual({ who: "World" });
	});
});
