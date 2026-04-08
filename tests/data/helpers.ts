export interface HexoDate {
	year: () => number;
	month: () => number;
	date: () => number;
	day: () => number;
	format: (fmt?: string) => string;
	locale: () => HexoDate;
	unix: () => number;
	toISOString: () => string;
	toString: () => string;
	valueOf: () => number;
	isBefore: () => boolean;
	isAfter: () => boolean;
	diff: () => number;
	clone: () => HexoDate;
	toDate: () => Date;
	subtract: (n: number, unit: string) => HexoDate;
	add: (n: number, unit: string) => HexoDate;
	startOf: (unit: string) => HexoDate;
	endOf: (unit: string) => HexoDate;
}

export interface HexoCollection<T> extends Array<T> {
	data?: T[];
	each: (fn: (item: T, index: number) => void) => string;
	sort: (field: unknown, order?: unknown) => HexoCollection<T>;
	limit: (n: number) => HexoCollection<T>;
	skip: (n: number) => HexoCollection<T>;
	eq: (i: number) => T | null;
	first: () => T | null;
	last: () => T | null;
	toArray: () => T[];
	random: () => HexoCollection<T>;
	count: () => number;
	size: () => number;
	find: (query: unknown) => T | HexoCollection<T> | null;
	findOne: (query: unknown) => T | Record<string, unknown>;
}

const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function createDate(dateStr?: string | number | null): HexoDate {
	const str = String(dateStr || "2025-01-15");
	const parts = str.match(/^(\d{4})[-/]?(\d{2})?[-/]?(\d{2})?/);
	const y = parts ? parseInt(parts[1]) : 2025;
	const m = parts?.[2] ? parseInt(parts[2]) : 1;
	const d = parts?.[3] ? parseInt(parts[3]) : 15;

	const obj: HexoDate = {
		year: () => y,
		month: () => m - 1,
		date: () => d,
		day: () => d,
		format: (fmt?: string) => {
			if (!fmt) return str;
			return fmt
				.replace("YYYY", String(y))
				.replace("YY", String(y).slice(-2))
				.replace("MMMM", MONTH_NAMES[m - 1])
				.replace("MMM", MONTH_SHORT[m - 1])
				.replace("MM", String(m).padStart(2, "0"))
				.replace(/(?<!M)M(?!M)/, String(m))
				.replace("DD", String(d).padStart(2, "0"))
				.replace(/(?<!D)D(?!D)/, String(d))
				.replace("dd", String(d).padStart(2, "0"))
				.replace("HH", "00")
				.replace("mm", "00")
				.replace("ss", "00");
		},
		locale: () => obj,
		unix: () => Math.floor(new Date(y, m - 1, d).getTime() / 1000),
		toISOString: () =>
			`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00.000Z`,
		toString: () => str,
		valueOf: () => new Date(y, m - 1, d).getTime(),
		isBefore: () => false,
		isAfter: () => false,
		diff: () => 0,
		clone: () => createDate(str),
		toDate: () => new Date(y, m - 1, d),
		subtract: (n: number, unit: string) => {
			const dt = new Date(y, m - 1, d);
			if (unit.startsWith("y")) dt.setFullYear(dt.getFullYear() - n);
			else if (unit === "M" || unit.startsWith("month"))
				dt.setMonth(dt.getMonth() - n);
			else dt.setDate(dt.getDate() - n);
			return createDate(
				`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
			);
		},
		add: (n: number, unit: string) => {
			const dt = new Date(y, m - 1, d);
			if (unit.startsWith("y")) dt.setFullYear(dt.getFullYear() + n);
			else if (unit === "M" || unit.startsWith("month"))
				dt.setMonth(dt.getMonth() + n);
			else dt.setDate(dt.getDate() + n);
			return createDate(
				`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
			);
		},
		startOf: (unit: string) => {
			if (unit === "month")
				return createDate(`${y}-${String(m).padStart(2, "0")}-01`);
			if (unit === "year") return createDate(`${y}-01-01`);
			return obj;
		},
		endOf: (unit: string) => {
			if (unit === "month") {
				const last = new Date(y, m, 0).getDate();
				return createDate(
					`${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`,
				);
			}
			if (unit === "year") return createDate(`${y}-12-31`);
			return obj;
		},
	};
	return obj;
}

export function createCollection<T>(items: T[]): HexoCollection<T> {
	const arr = [...items] as unknown as HexoCollection<T>;
	arr.data = items;
	arr.each = function (fn) {
		items.forEach(fn);
		return "";
	};
	arr.sort = function (field, order?) {
		if (typeof field === "function")
			return createCollection([...items].sort(field as never));
		const desc =
			order === "desc" ||
			order === -1 ||
			(typeof field === "string" && field.startsWith("-"));
		const name =
			typeof field === "string" ? field.replace(/^-/, "") : "date";
		const sorted = [...items].sort((a, b) => {
			let va = (a as Record<string, unknown>)[name];
			let vb = (b as Record<string, unknown>)[name];
			if (va && typeof va === "object" && typeof (va as { valueOf: () => unknown }).valueOf === "function")
				va = (va as { valueOf: () => unknown }).valueOf();
			if (vb && typeof vb === "object" && typeof (vb as { valueOf: () => unknown }).valueOf === "function")
				vb = (vb as { valueOf: () => unknown }).valueOf();
			return desc
				? ((vb as number) > (va as number) ? 1 : -1)
				: ((va as number) > (vb as number) ? 1 : -1);
		});
		return createCollection(sorted);
	};
	arr.limit = function (n) { return createCollection(items.slice(0, n)); };
	arr.skip = function (n) { return createCollection(items.slice(n)); };
	arr.eq = function (i) { return items[i] ?? null; };
	arr.first = function () { return items[0] ?? null; };
	arr.last = function () { return items[items.length - 1] ?? null; };
	arr.toArray = function () { return items; };
	arr.random = function () { return createCollection([...items].sort(() => Math.random() - 0.5)); };
	arr.count = function () { return items.length; };
	arr.size = function () { return items.length; };
	arr.find = function (query) {
		if (typeof query === "function") return items.filter(query as never)[0] ?? null;
		if (query && typeof query === "object") {
			const q = query as Record<string, unknown>;
			return createCollection(
				items.filter((item) => {
					const obj = item as Record<string, unknown>;
					return Object.keys(q).every((k) => obj[k] === q[k]);
				}),
			);
		}
		return createCollection([]);
	};
	arr.findOne = function (query) {
		if (query && typeof query === "object") {
			const q = query as Record<string, unknown>;
			return items.find((item) => {
				const obj = item as Record<string, unknown>;
				return Object.keys(q).every((k) => obj[k] === q[k]);
			}) ?? { posts: createCollection([]), name: "", length: 0 };
		}
		return items[0] ?? { posts: createCollection([]), name: "", length: 0 };
	};
	return arr;
}

const noop = () => "";
const identity = (s: unknown) => String(s ?? "");

export function createHexoHelpers() {
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
		link_to: (path: unknown, text: unknown, opts?: Record<string, unknown>) =>
			`<a href="${path}"${opts?.class ? ` class="${opts.class}"` : ""}>${text || path}</a>`,
		moment: Object.assign(
			(d: unknown) => createDate(d as string),
			{ locale: () => {} },
		),
		md5: (s: unknown) => String(s).replace(/\W/g, "").slice(0, 8),
		thumbnail: (post: unknown) =>
			(post as Record<string, unknown>)?.thumbnail || "/images/default.jpg",
		excerpt: (post: unknown) =>
			(post as Record<string, unknown>)?.excerpt || "",
		generate_description: noop,
		generate_keywords: noop,
		hierarchicalCategoryList: () => [],
	};
}

export function createExpressHelpers() {
	return {};
}
