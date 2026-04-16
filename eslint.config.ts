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
]);
