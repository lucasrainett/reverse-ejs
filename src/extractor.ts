import type {
	Pattern,
	LoopPattern,
	ExtractedObject,
	ExtractedItem,
	EjsOptions,
} from "./types";
import { buildRegex, fromCaptureName, toCaptureName } from "./regexBuilder";

function unescapeHtml(s: string): string {
	return s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

const BRANCH_RE = /^(.+)_C(\d+)([TE])$/;
const SENTINEL_RE = /^_C\d+[TE]S$/;

export function extract(
	pattern: Pattern,
	finalString: string,
	opts?: EjsOptions,
): ExtractedObject {
	const unescape = opts?.unescape ?? unescapeHtml;
	const regexStr = buildRegex(pattern);
	const regex = new RegExp(`^${regexStr}$`, "s");
	const match = regex.exec(finalString);

	if (!match) {
		throw new Error(
			`Template does not match the final string.\n` +
				`Regex: ${regexStr}\n` +
				`String: ${finalString}`,
		);
	}

	if (!match.groups) return {};

	return groupsToObject(match.groups, pattern, unescape);
}

function groupsToObject(
	groups: Record<string, string | undefined>,
	pattern: Pattern,
	unescape: (s: string) => string,
): ExtractedObject {
	const result: ExtractedObject = {};

	for (const captureName of Object.keys(groups)) {
		const value = groups[captureName];
		if (value == null) continue;

		if (captureName.endsWith("_LOOP")) {
			const arrayName = fromCaptureName(captureName.slice(0, -5));
			const loopPattern = findLoop(pattern, arrayName);
			if (loopPattern) {
				result[arrayName] = extractLoopItems(
					loopPattern,
					value,
					unescape,
				);
			}
		} else if (SENTINEL_RE.test(captureName)) {
			// sentinel — handled by extractConditionBooleans
		} else {
			const branchMatch = BRANCH_RE.exec(captureName);
			if (branchMatch) {
				result[fromCaptureName(branchMatch[1])] = unescape(value);
			} else {
				result[fromCaptureName(captureName)] = unescape(value);
			}
		}
	}

	extractConditionBooleans(groups, pattern, result);
	return result;
}

function extractLoopItems(
	loopPattern: LoopPattern,
	loopSection: string,
	unescape: (s: string) => string,
): ExtractedItem[] {
	if (!loopSection) return [];

	const bodyRegexStr = buildRegex(
		loopPattern.body,
		loopPattern.itemName || undefined,
		new Set(),
		undefined,
		loopPattern.loopVar,
	);
	const bodyRegex = new RegExp(bodyRegexStr, "gs");

	const items: ExtractedItem[] = [];
	let match: RegExpExecArray | null;

	while ((match = bodyRegex.exec(loopSection)) !== null) {
		if (!match.groups) continue;

		const simpleGroups: Record<string, string> = {};
		const nestedLoops: Record<string, string> = {};

		for (const key of Object.keys(match.groups)) {
			const val = match.groups[key];
			if (val == null) continue;
			if (key.endsWith("_LOOP")) nestedLoops[key.slice(0, -5)] = val;
			else simpleGroups[key] = val;
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
				item[fromCaptureName(k)] = unescape(v);
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
					item[arrayName] = extractLoopItems(
						nested,
						content,
						unescape,
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
			if (thenMatched) result[pattern.condition] = true;
			else if (elseMatched) result[pattern.condition] = false;
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
