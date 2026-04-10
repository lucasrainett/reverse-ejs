import type {
	Pattern,
	LoopPattern,
	ExtractedObject,
	ExtractedItem,
	EjsOptions,
	CoercionType,
} from "./types";
import {
	buildRegex,
	collectExpressions,
	fromCaptureName,
	toCaptureName,
} from "./regexBuilder";
import { ReverseEjsError } from "./errors";

function unescapeHtml(s: string): string {
	return s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

const BRANCH_RE = /^(.+)_C(\d+)([TE])(?:_RAW)?$/;
const SENTINEL_RE = /^_C\d+[TE]S$/;
const RAW_RE = /_RAW$/;

function setNested(
	obj: Record<string, unknown>,
	dottedKey: string,
	value: unknown,
): void {
	const parts = dottedKey.split(".");
	if (parts.length === 1) {
		obj[dottedKey] = value;
		return;
	}
	let current = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const key = parts[i];
		if (
			current[key] == null ||
			typeof current[key] !== "object" ||
			Array.isArray(current[key])
		) {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}
	current[parts[parts.length - 1]] = value;
}

function coerceValue(
	value: string,
	type: CoercionType,
	keyForWarning: string,
	silent?: boolean,
): unknown {
	if (type === "string") return value;
	if (type === "number") {
		const n = Number(value);
		if (Number.isNaN(n)) {
			if (!silent) {
				console.warn(
					`[reverse-ejs] Could not coerce "${value}" to number for key "${keyForWarning}" - keeping original string.`,
				);
			}
			return value;
		}
		return n;
	}
	if (type === "boolean") {
		const lower = value.toLowerCase();
		if (lower === "true") return true;
		if (lower === "false") return false;
		if (!silent) {
			console.warn(
				`[reverse-ejs] Could not coerce "${value}" to boolean for key "${keyForWarning}" - keeping original string.`,
			);
		}
		return value;
	}
	if (type === "date") {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) {
			if (!silent) {
				console.warn(
					`[reverse-ejs] Could not coerce "${value}" to date for key "${keyForWarning}" - keeping original string.`,
				);
			}
			return value;
		}
		return d;
	}
	return value;
}

function applyCoercions(
	obj: Record<string, unknown>,
	types: Record<string, CoercionType>,
	silent?: boolean,
): void {
	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				if (
					item &&
					typeof item === "object" &&
					!(item instanceof Date)
				) {
					applyCoercions(
						item as Record<string, unknown>,
						types,
						silent,
					);
				}
			}
		} else if (
			value &&
			typeof value === "object" &&
			!(value instanceof Date)
		) {
			applyCoercions(value as Record<string, unknown>, types, silent);
		} else if (typeof value === "string" && types[key] !== undefined) {
			obj[key] = coerceValue(value, types[key], key, silent);
		}
	}
}

function warnSkippedExpressions(pattern: Pattern, silent?: boolean): void {
	if (silent) return;
	const exprs: string[] = [];
	collectExpressions(pattern, exprs);
	for (const expr of exprs) {
		console.warn(
			`[reverse-ejs] Expression "<%= ${expr} %>" was skipped - only plain variable names can be extracted.`,
		);
	}
}

function findLastVariableName(pattern: Pattern): string | null {
	const names: string[] = [];
	function walk(p: Pattern): void {
		if (p.type === "variable") {
			names.push(p.name);
		} else if (p.type === "sequence") {
			for (const part of p.parts) walk(part);
		} else if (p.type === "loop") {
			walk(p.body);
		} else if (p.type === "conditional") {
			walk(p.thenBranch);
			if (p.elseBranch) walk(p.elseBranch);
		}
	}
	walk(pattern);
	return names[names.length - 1] ?? null;
}

function buildMatchError(
	pattern: Pattern,
	regexStr: string,
	finalString: string,
): ReverseEjsError {
	const lastVar = findLastVariableName(pattern);
	const excerpt =
		finalString.length > 80
			? finalString.slice(0, 40) + "..." + finalString.slice(-40)
			: finalString;
	const varPart = lastVar
		? `Could not match variable "${lastVar}" - `
		: "Template does not match the rendered string - ";
	const message =
		varPart +
		`unexpected content near "${excerpt}". ` +
		`(Access error.details for the full regex and input string.)`;
	return new ReverseEjsError(message, {
		regex: regexStr,
		input: finalString,
	});
}

export function extract(
	pattern: Pattern,
	finalString: string,
	opts?: EjsOptions,
): ExtractedObject | null {
	const unescape = opts?.unescape ?? unescapeHtml;
	const flexWs = opts?.flexibleWhitespace;
	const silent = opts?.silent;
	const safe = opts?.safe;

	warnSkippedExpressions(pattern, silent);

	const regexStr = buildRegex(
		pattern,
		undefined,
		new Set(),
		undefined,
		undefined,
		flexWs,
	);
	const regex = new RegExp(`^${regexStr}$`, "s");
	const match = regex.exec(finalString);

	if (!match) {
		if (safe) return null;
		throw buildMatchError(pattern, regexStr, finalString);
	}

	const result: ExtractedObject = match.groups
		? groupsToObject(match.groups, pattern, unescape, flexWs)
		: {};

	if (opts?.types) {
		applyCoercions(result as Record<string, unknown>, opts.types, silent);
	}

	return result;
}

function groupsToObject(
	groups: Record<string, string | undefined>,
	pattern: Pattern,
	unescape: (s: string) => string,
	flexWs?: boolean,
): ExtractedObject {
	const result: ExtractedObject = {};

	for (const captureName of Object.keys(groups)) {
		const value = groups[captureName];
		if (value == null) continue;

		if (captureName.endsWith("_LOOP")) {
			const arrayName = fromCaptureName(captureName.slice(0, -5));
			const loopPattern = findLoop(pattern, arrayName);
			if (loopPattern) {
				setNested(
					result,
					arrayName,
					extractLoopItems(loopPattern, value, unescape, flexWs),
				);
			}
		} else if (SENTINEL_RE.test(captureName)) {
			// sentinel - handled by extractConditionBooleans
		} else {
			const isRaw = RAW_RE.test(captureName);
			const cleanName = captureName.replace(RAW_RE, "");
			const branchMatch = BRANCH_RE.exec(cleanName);
			const dottedKey = branchMatch
				? fromCaptureName(branchMatch[1])
				: fromCaptureName(cleanName);
			const val = isRaw ? value : unescape(value);
			setNested(result, dottedKey, val);
		}
	}

	extractConditionBooleans(groups, pattern, result);
	return result;
}

function extractLoopItems(
	loopPattern: LoopPattern,
	loopSection: string,
	unescape: (s: string) => string,
	flexWs?: boolean,
): ExtractedItem[] {
	if (!loopSection) return [];

	const bodyRegexStr = buildRegex(
		loopPattern.body,
		loopPattern.itemName || undefined,
		new Set(),
		undefined,
		loopPattern.loopVar,
		flexWs,
	);
	const bodyRegex = new RegExp(bodyRegexStr, "gs");

	const items: ExtractedItem[] = [];
	let match: RegExpExecArray | null;

	while ((match = bodyRegex.exec(loopSection)) !== null) {
		if (!match.groups) continue;

		const simpleGroups: Record<string, string> = {};
		const nestedLoops: Record<string, string> = {};

		for (const rawKey of Object.keys(match.groups)) {
			const val = match.groups[rawKey];
			if (val == null) continue;
			const key = rawKey.replace(RAW_RE, "");
			if (SENTINEL_RE.test(key)) continue;
			if (key.endsWith("_LOOP")) nestedLoops[key.slice(0, -5)] = val;
			else {
				const branchMatch = BRANCH_RE.exec(key);
				if (branchMatch) {
					simpleGroups[branchMatch[1]] = val;
				} else {
					simpleGroups[key] = val;
				}
			}
		}

		const allKeys = [
			...Object.keys(simpleGroups),
			...Object.keys(nestedLoops),
		];

		const expectedItemKey = loopPattern.itemName
			? toCaptureName(loopPattern.itemName)
			: null;
		const isSimple =
			allKeys.length === 1 &&
			(!expectedItemKey || allKeys[0] === expectedItemKey);

		if (isSimple) {
			items.push(unescape(simpleGroups[allKeys[0]]));
		} else {
			const item: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(simpleGroups)) {
				setNested(item, fromCaptureName(k), unescape(v));
			}
			for (const [encodedName, content] of Object.entries(nestedLoops)) {
				const arrayName = fromCaptureName(encodedName);
				const nested =
					findLoop(loopPattern.body, arrayName) ??
					findLoop(
						loopPattern.body,
						`${loopPattern.itemName}.${arrayName}`,
					);
				if (nested)
					setNested(
						item,
						arrayName,
						extractLoopItems(nested, content, unescape, flexWs),
					);
			}
			items.push(item);
		}
	}

	return items;
}

function extractConditionBooleans(
	groups: Record<string, string | undefined>,
	pattern: Pattern,
	result: ExtractedObject,
): void {
	if (pattern.type === "conditional") {
		if (pattern.condition) {
			const id = pattern.condId ?? 0;
			const thenMatched = groups[`_C${id}TS`] !== undefined;
			const elseMatched = groups[`_C${id}ES`] !== undefined;
			// Don't overwrite nested object with a boolean
			const existing = result[pattern.condition];
			const hasNestedData =
				existing != null &&
				typeof existing === "object" &&
				!Array.isArray(existing) &&
				!(existing instanceof Date);
			if (!hasNestedData) {
				if (thenMatched) result[pattern.condition] = true;
				else if (elseMatched) result[pattern.condition] = false;
			}
		}
		extractConditionBooleans(groups, pattern.thenBranch, result);
		if (pattern.elseBranch)
			extractConditionBooleans(groups, pattern.elseBranch, result);
	} else if (pattern.type === "sequence") {
		for (const part of pattern.parts)
			extractConditionBooleans(groups, part, result);
	} else if (pattern.type === "loop") {
		extractConditionBooleans(groups, pattern.body, result);
	}
}

function findLoop(pattern: Pattern, arrayName: string): LoopPattern | null {
	if (pattern.type === "loop") {
		if (
			pattern.arrayName === arrayName ||
			pattern.arrayName.endsWith(`.${arrayName}`)
		) {
			return pattern;
		}
		return findLoop(pattern.body, arrayName);
	}
	if (pattern.type === "sequence") {
		for (const part of pattern.parts) {
			const found = findLoop(part, arrayName);
			if (found) return found;
		}
	}
	if (pattern.type === "conditional") {
		const found = findLoop(pattern.thenBranch, arrayName);
		if (found) return found;
		if (pattern.elseBranch) return findLoop(pattern.elseBranch, arrayName);
	}
	return null;
}
