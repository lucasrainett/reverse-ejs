export class ReverseEjsError extends Error {
	details: { regex: string; input: string };

	constructor(message: string, details: { regex: string; input: string }) {
		super(message);
		this.name = "ReverseEjsError";
		this.details = details;
		Object.setPrototypeOf(this, ReverseEjsError.prototype);
	}
}
