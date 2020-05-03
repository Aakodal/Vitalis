export function getUserIdFromString(input: string) {
	const mentionTemplate = input.match(/^<@!?(?<mention>\d+)>$|^(?<id>\d+)$/);
	return mentionTemplate?.groups.mention || mentionTemplate?.groups.id;
}
