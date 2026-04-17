import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs", "iife"],
	// DTS emitted by `tsc` in a separate build:dts step. tsup's rollup-dts
	// path unconditionally sets `baseUrl`, which TS 6 deprecates.
	dts: false,
	clean: true,
	target: "es2020",
	sourcemap: true,
	globalName: "ReverseEjs",
});
