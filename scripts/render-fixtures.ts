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

function createHelpers(): Record<string, unknown> {
	const noop = () => "";
	const identity = (s: unknown) => String(s ?? "");

	return {
		__: identity,
		_p: identity,
		url_for: identity,
		full_url_for: identity,
		relative_url: identity,
		url_join: (...a: unknown[]) => a.map(String).join("/"),
		css: (p: unknown) => `<link rel="stylesheet" href="${p}">`,
		js: (p: unknown) => `<script src="${p}"></script>`,
		partial: noop,
		fragment_cache: (_n: unknown, fn: unknown) =>
			typeof fn === "function" ? fn() : "",
		gravatar: () => "https://example.com/avatar.png",
		is_home: () => true,
		is_post: () => false,
		is_page: () => false,
		is_archive: () => false,
		is_year: () => false,
		is_month: () => false,
		is_category: () => false,
		is_tag: () => false,
		is_current: () => false,
		strip_html: identity,
		truncate: identity,
		word_wrap: identity,
		titlecase: identity,
		markdown: identity,
		render: identity,
		date: () => "2025-01-15",
		date_xml: () => "2025-01-15T00:00:00.000Z",
		time: () => "12:00:00",
		full_date: () => "January 15, 2025",
		relative_date: () => "3 months ago",
		time_tag: () => "<time>2025-01-15</time>",
		moment: () => ({
			format: () => "2025-01-15",
			fromNow: () => "3 months ago",
			toISOString: () => "2025-01-15T00:00:00.000Z",
		}),
		number_format: identity,
		paginator: noop,
		search_form: () => '<input type="search" placeholder="Search">',
		tagcloud: noop,
		list_categories: noop,
		list_tags: noop,
		list_posts: noop,
		list_archives: noop,
		toc: noop,
		open_graph: noop,
		meta_generator: noop,
		feed_tag: noop,
		inject_point: noop,
		canonical: () => "https://example.com/page",
		pretty_url: identity,
		absolute_url: identity,
		is_remote_url: () => false,
		icon: identity,
		scrollreveal: noop,
		stellar_info: noop,
		stellar_config: noop,
		post_title: identity,
		page_title: identity,
		theme_config: noop,
		JSON: globalThis.JSON,
		Math: globalThis.Math,
		parseInt: globalThis.parseInt,
		parseFloat: globalThis.parseFloat,
		encodeURIComponent: globalThis.encodeURIComponent,
		decodeURIComponent: globalThis.decodeURIComponent,
		Object: globalThis.Object,
		Array: globalThis.Array,
		String: globalThis.String,
		Number: globalThis.Number,
		Boolean: globalThis.Boolean,
		Date: globalThis.Date,
		RegExp: globalThis.RegExp,
		Error: globalThis.Error,
		isNaN: globalThis.isNaN,
		_: {
			compact: (a: unknown[]) => (a || []).filter(Boolean),
			flatten: (a: unknown[]) => (a || []).flat(),
			uniq: (a: unknown[]) => [...new Set(a || [])],
			pick: (o: unknown) => o,
			merge: Object.assign,
			get: (_obj: unknown, _path: string, def: unknown) => def ?? "",
		},
	};
}

function render(
	template: string,
	data: Record<string, unknown>,
): string | null {
	const helpers = createHelpers();
	const merged = { ...helpers, ...data };

	for (let i = 0; i < 30; i++) {
		try {
			return ejs.render(template, merged, { strict: false });
		} catch (e) {
			const msg = (e as Error).message;
			const fnm = /(\w+) is not a function/.exec(msg);
			if (fnm) {
				merged[fnm[1]] = () => "";
				continue;
			}
			const und = /(\w+) is not defined/.exec(msg);
			if (und) {
				merged[und[1]] =
					und[1] in helpers
						? helpers[und[1] as keyof typeof helpers]
						: "";
				continue;
			}
			const prop =
				/Cannot read propert(?:y|ies) of (?:undefined|null) \(reading '(\w+)'\)/.exec(
					msg,
				);
			if (prop) {
				merged[prop[1]] = {};
				continue;
			}
			const meth = /(\w+)\.(\w+) is not a function/.exec(msg);
			if (
				meth &&
				merged[meth[1]] &&
				typeof merged[meth[1]] === "object"
			) {
				(merged[meth[1]] as Record<string, unknown>)[meth[2]] = () =>
					"";
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
	let noData = 0;

	for (let i = 0; i < urls.length; i++) {
		const localPath = urlToPath(urls[i]);
		const fixturePath = join(FIXTURES_DIR, localPath);
		const dataPath = join(DATA_DIR, localPath.replace(/\.ejs$/, ".json"));
		const renderedPath = join(RENDERED_DIR, localPath);

		if (!force && existsSync(renderedPath)) {
			skipped++;
			continue;
		}

		if (!existsSync(dataPath)) {
			noData++;
			continue;
		}

		let template: string;
		try {
			template = readFileSync(fixturePath, "utf-8");
		} catch {
			failed++;
			continue;
		}

		const data = JSON.parse(readFileSync(dataPath, "utf-8"));
		const rendered = render(template, data);

		if (rendered !== null) {
			mkdirSync(dirname(renderedPath), { recursive: true });
			writeFileSync(renderedPath, rendered);
			success++;
		} else {
			failed++;
		}

		if ((i + 1) % 100 === 0 || i === urls.length - 1) {
			process.stdout.write(
				`\r  ${i + 1}/${urls.length} (${success} ok, ${failed} failed, ${skipped} skipped)`,
			);
		}
	}

	console.log(
		`\nDone: ${success} rendered, ${failed} failed, ${skipped} skipped, ${noData} no data`,
	);
}

main();
