import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Exclude Playwright e2e specs so vitest doesn't try to run them as
		// unit tests. Defaults are kept (node_modules, dist, etc.).
		exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
	},
});
