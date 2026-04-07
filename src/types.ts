// ─── Tokens ──────────────────────────────────────────────────────────────────

export type Token =
	| { type: "literal"; value: string }
	| { type: "variable"; name: string }
	| {
			type: "loop_start";
			arrayName: string;
			itemName: string;
			loopVar?: string;
	  }
	| { type: "loop_end" }
	| { type: "if_start"; condition?: string }
	| { type: "else" }
	| { type: "if_end" };

// ─── Patterns ────────────────────────────────────────────────────────────────

export type Pattern =
	| { type: "sequence"; parts: Pattern[] }
	| { type: "literal"; value: string }
	| { type: "variable"; name: string }
	| {
			type: "loop";
			arrayName: string;
			itemName: string;
			body: Pattern;
			loopVar?: string;
	  }
	| {
			type: "conditional";
			thenBranch: Pattern;
			elseBranch?: Pattern;
			condition?: string;
			condId?: number;
	  };

export type LoopPattern = Extract<Pattern, { type: "loop" }>;

// ─── Options ─────────────────────────────────────────────────────────────────

export interface EjsOptions {
	/** Override the tag delimiter character (default `%`). */
	delimiter?: string;
	/** Override the opening delimiter character (default `<`). */
	openDelimiter?: string;
	/** Override the closing delimiter character (default `>`). */
	closeDelimiter?: string;
	/** Mirror EJS's rmWhitespace — strip leading/trailing whitespace from every template line. */
	rmWhitespace?: boolean;
	/** Custom HTML-unescape function; defaults to the standard 5-entity map. */
	unescape?: (s: string) => string;
	/** Map of partial name → EJS source for <%- include("name") %> expansion. */
	partials?: Record<string, string>;
}

// ─── Output ──────────────────────────────────────────────────────────────────

export type ExtractedItem = string | Record<string, unknown>;
export type ExtractedValue = string | boolean | ExtractedItem[];
export type ExtractedObject = Record<string, ExtractedValue>;
