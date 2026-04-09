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
]);
