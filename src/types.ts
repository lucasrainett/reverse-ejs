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

export interface EjsOptions {
	delimiter?: string;
	openDelimiter?: string;
	closeDelimiter?: string;
	rmWhitespace?: boolean;
	unescape?: (s: string) => string;
	partials?: Record<string, string>;
}

export type ExtractedItem = string | Record<string, unknown>;
export type ExtractedValue = string | boolean | ExtractedItem[];
export type ExtractedObject = Record<string, ExtractedValue>;
