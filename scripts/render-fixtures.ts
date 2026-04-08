import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "..", "tests", "fixtures");
const DATA_DIR = join(__dirname, "..", "tests", "data");
const RENDERED_DIR = join(__dirname, "..", "tests", "rendered");
const MANIFEST_PATH = join(__dirname, "..", "tests", "test.json");

function urlToPath(url: string): string {
	const parts = url.split("/");
	return [parts[0], parts[1], ...parts.slice(3)].join("/");
}

async function loadData(tsPath: string): Promise<Record<string, unknown>> {
	const mod = await import(tsPath);
	return mod.default;
}

function render(template: string, data: Record<string, unknown>): string | null {
	for (let i = 0; i < 30; i++) {
		try {
			return ejs.render(template, data, { strict: false });
		} catch (e) {
			const msg = (e as Error).message;
			const fnm = /(\w+) is not a function/.exec(msg);
			if (fnm) { data[fnm[1]] = () => ""; continue; }
			const und = /(\w+) is not defined/.exec(msg);
			if (und) { data[und[1]] = ""; continue; }
			const prop = /Cannot read propert(?:y|ies) of (?:undefined|null) \(reading '(\w+)'\)/.exec(msg);
			if (prop) { data[prop[1]] = {}; continue; }
			const meth = /(\w+)\.(\w+) is not a function/.exec(msg);
			if (meth && data[meth[1]] && typeof data[meth[1]] === "object") {
				(data[meth[1]] as Record<string, unknown>)[meth[2]] = () => "";
				continue;
			}
			return null;
		}
	}
	return null;
}

async function main() {
	const urls: string[] = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
	const force = process.argv.includes("--force");

	let success = 0;
	let failed = 0;
	let skipped = 0;

	for (let i = 0; i < urls.length; i++) {
		const localPath = urlToPath(urls[i]);
		const fixturePath = join(FIXTURES_DIR, localPath);
		const dataPath = join(DATA_DIR, localPath.replace(/\.ejs$/, ".ts"));
		const renderedPath = join(RENDERED_DIR, localPath);

		if (!force && existsSync(renderedPath)) {
			skipped++;
			continue;
		}

		if (!existsSync(dataPath)) {
			failed++;
			continue;
		}

		let template: string;
		try {
			template = readFileSync(fixturePath, "utf-8");
		} catch {
			failed++;
			continue;
		}

		try {
			const data = await loadData(dataPath);
			const rendered = render(template, { ...data });

			if (rendered !== null) {
				mkdirSync(dirname(renderedPath), { recursive: true });
				writeFileSync(renderedPath, rendered);
				success++;
			} else {
				failed++;
			}
		} catch {
			failed++;
		}

		if ((i + 1) % 100 === 0 || i === urls.length - 1) {
			process.stdout.write(
				`\r  ${i + 1}/${urls.length} (${success} ok, ${failed} failed, ${skipped} skipped)`,
			);
		}
	}

	console.log(
		`\nDone: ${success} rendered, ${failed} failed, ${skipped} skipped`,
	);
}

main();
