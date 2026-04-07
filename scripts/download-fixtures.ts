import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "..", "tests", "fixtures");
const MANIFEST_PATH = join(__dirname, "..", "tests", "test.json");
const RAW_BASE = "https://raw.githubusercontent.com/";
const CONCURRENCY = 20;

// owner/repo/commit/file/path.ejs → owner/repo/file/path.ejs
function urlToPath(url: string): string {
	const parts = url.split("/");
	return [parts[0], parts[1], ...parts.slice(3)].join("/");
}

async function download(
	url: string,
): Promise<"downloaded" | "skipped" | "failed"> {
	const dest = join(FIXTURES_DIR, urlToPath(url));

	if (existsSync(dest)) return "skipped";

	const res = await fetch(RAW_BASE + url);
	if (!res.ok) {
		console.error(`  ✗ ${res.status} ${url}`);
		return "failed";
	}

	const content = await res.text();
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, content, "utf-8");
	return "downloaded";
}

async function main() {
	const urls: string[] = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));

	mkdirSync(FIXTURES_DIR, { recursive: true });
	console.log(`Manifest: ${urls.length} fixtures`);

	let downloaded = 0;
	let skipped = 0;
	let failed = 0;

	for (let i = 0; i < urls.length; i += CONCURRENCY) {
		const batch = urls.slice(i, i + CONCURRENCY);
		const results = await Promise.all(batch.map(download));

		for (const r of results) {
			if (r === "downloaded") downloaded++;
			else if (r === "skipped") skipped++;
			else failed++;
		}

		const progress = Math.min(i + CONCURRENCY, urls.length);
		process.stdout.write(`\r  ${progress}/${urls.length}`);
	}

	console.log(
		`\nDone: ${downloaded} downloaded, ${skipped} already present, ${failed} failed`,
	);
}

main();
