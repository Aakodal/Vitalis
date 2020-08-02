export function stringNormalize(baseString: string): string {
	const firstLetter = baseString.charAt(0).toUpperCase();
	const base = baseString.slice(1).toLowerCase();

	return firstLetter + base;
}
