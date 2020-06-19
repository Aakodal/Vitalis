export function getChannelIdFromString(input: string): string {
	const mentionTemplate = input.match(/^<#(?<channel>\d+)>$|^(?<id>\d+)$/);
	return mentionTemplate?.groups.channel || mentionTemplate?.groups.id;
}
