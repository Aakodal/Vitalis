export function getRoleIdFromString(input: string): string {
	const mentionTemplate = input.match(/^<@&(?<role>\d+)>$|^(?<id>\d+)$/);
	return mentionTemplate?.groups.role || mentionTemplate?.groups.id;
}
