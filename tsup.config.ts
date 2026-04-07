import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs", "iife"],
	dts: true,
	clean: true,
	target: "es2020",
	sourcemap: true,
	globalName: "ReverseEjs",
});
