export function getUserIdFromString(input: string): string | undefined {
	const mentionTemplate = input?.match(/^<@!?(?<mention>\d+)>$|^(?<id>\d+)$/);
	return mentionTemplate?.groups?.mention || mentionTemplate?.groups?.id;
}
