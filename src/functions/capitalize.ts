export function capitalize(baseString: string): string {
	const firstLetter = baseString.charAt(0).toUpperCase();
	const base = baseString.slice(1).toLowerCase().replace(/_/g, " ");

	return firstLetter + base;
}
