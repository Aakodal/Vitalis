export function fromArrayToLone(array: any | any[]) {
	return Array.isArray(array)
		? array[0]
		: array;
}
