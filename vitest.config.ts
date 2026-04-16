import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Exclude Playwright e2e specs and the perf suite so vitest doesn't
		// pick up either as unit tests. Defaults are kept (node_modules,
		// dist, etc.). `perf/` files use bare `.ts` today and wouldn't match
		// vitest's default include, but excluding the directory is defensive
		// against anyone naming a future perf file `*.test.ts` or `*.spec.ts`.
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/e2e/**",
			"**/perf/**",
		],
	},
});
