import { defineConfig } from "eslint/config";
import { configs as esConfig } from "@eslint/js";
import { configs as tsConfig } from "typescript-eslint";

export default defineConfig([
	esConfig.recommended,
	...tsConfig.recommended,
	{
		ignores: ["dist/", "coverage/", "node_modules/"],
	},
	{
		files: ["src/**/*.ts"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
	{
		// Plain ES5 browser script — has no TS context, runs as a classic
		// <script> tag, and uses standard browser/DOM globals.
		files: ["docs/**/*.js"],
		languageOptions: {
			sourceType: "script",
			globals: {
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				history: "readonly",
				URLSearchParams: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				console: "readonly",
			},
		},
	},
	{
		// Node-side e2e harness: Playwright tests + the static dev server
		// + the Playwright config file. Needs node globals plus the
		// browser globals that appear inside page.evaluate / addInitScript
		// callbacks.
		files: [
			"e2e/**/*.ts",
			"e2e/**/*.mjs",
			"e2e/**/*.js",
			"playwright.config.ts",
		],
		languageOptions: {
			globals: {
				process: "readonly",
				console: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				history: "readonly",
			},
		},
	},
	{
		// Performance suite — pure node scripts, run via `tsx`.
		files: ["perf/**/*.ts"],
		languageOptions: {
			globals: {
				process: "readonly",
				console: "readonly",
			},
		},
		rules: {
			// runner.ts uses require() to lazily import private library modules.
			"@typescript-eslint/no-require-imports": "off",
		},
	},
]);
