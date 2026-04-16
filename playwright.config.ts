import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = 4173;

// Use whichever Chromium binary is available without triggering a bundled
// download. Order: explicit env override → system Chromium on macOS → fall
// back to whatever Playwright finds (bundled, will need `playwright install`).
function resolveChromium(): string | undefined {
	const env = process.env.PLAYWRIGHT_CHROMIUM_PATH;
	if (env && existsSync(env)) return env;
	const macDefault = "/Applications/Chromium.app/Contents/MacOS/Chromium";
	if (process.platform === "darwin" && existsSync(macDefault))
		return macDefault;
	return undefined;
}

const chromiumPath = resolveChromium();

// `PW_SLOW_MO=300 pnpm e2e:headed` adds a 300ms pause between each action so
// you can actually follow what the browser is doing. Unset = full speed.
const slowMo = process.env.PW_SLOW_MO ? Number(process.env.PW_SLOW_MO) : 0;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		trace: "on-first-retry",
		// Granted by default for the playground's clipboard feature.
		permissions: ["clipboard-read", "clipboard-write"],
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				launchOptions: {
					...(chromiumPath ? { executablePath: chromiumPath } : {}),
					...(slowMo > 0 ? { slowMo } : {}),
				},
			},
		},
	],
	webServer: {
		// `pnpm build` first because tests intercept the unpkg CDN URL and
		// fulfill it with the freshly-built dist/index.global.js. Without a
		// current build, every test would either fail (no file to serve) or
		// silently test stale code.
		// `-c-1` disables caching so iterative edits to docs/ are picked up.
		// `-s` silences the per-request log line.
		command: `pnpm build && npx --yes http-server docs -p ${PORT} -c-1 -s`,
		url: `http://127.0.0.1:${PORT}/`,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});
