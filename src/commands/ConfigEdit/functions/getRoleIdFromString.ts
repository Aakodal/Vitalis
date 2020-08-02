export function getRoleIdFromString(input: string): string | undefined {
	const mentionTemplate = input.match(/^<@&(?<role>\d+)>$|^(?<id>\d+)$/);
	return mentionTemplate?.groups?.role || mentionTemplate?.groups?.id;
}
