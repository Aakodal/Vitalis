export function capitalize(baseString: string): string {
	return baseString[0].toUpperCase() + baseString.slice(1).toLowerCase().replaceAll("_", " ");
}
