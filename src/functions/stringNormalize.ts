export function stringNormalize(baseString: string): string {
	const firstLetter = baseString.charAt(0).toUpperCase();
	const rest = baseString.slice(1).replace("_", " ");

	return firstLetter + rest;
}
