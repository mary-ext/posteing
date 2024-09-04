export function assert(condition: any, message?: string): asserts condition {
	if (import.meta.env.DEV && !condition) {
		throw new Error(`Assertion failed` + (message ? `: ${message}` : ``));
	}
}
