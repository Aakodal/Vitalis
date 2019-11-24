export function fromArrayToLone<T>(array: T | T[]) {
	return Array.isArray(array)
		? array[0]
		: array;
}
