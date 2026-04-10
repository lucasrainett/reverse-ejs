/**
 * Error thrown by `reverseEjs()` when the template cannot be matched against
 * the rendered string.
 *
 * The `message` is human-readable and identifies the problematic variable
 * when possible. The full regex and input string are stored on `details` so
 * they don't pollute the message.
 *
 * @example
 * try {
 *   reverseEjs(template, html);
 * } catch (e) {
 *   if (e instanceof ReverseEjsError) {
 *     console.error(e.message);          // human-readable
 *     console.error(e.details.regex);    // compiled regex
 *     console.error(e.details.input);    // the input string
 *   }
 * }
 */
export class ReverseEjsError extends Error {
	/**
	 * Raw debug information not included in the human-readable message.
	 */
	details: { regex: string; input: string };

	constructor(message: string, details: { regex: string; input: string }) {
		super(message);
		this.name = "ReverseEjsError";
		this.details = details;
		Object.setPrototypeOf(this, ReverseEjsError.prototype);
	}
}
