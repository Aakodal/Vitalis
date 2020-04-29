export function getUserSnowflakeFromString(input: string) {
	const mentionTemplate = input.match(/^(<@!?\d+>)|\d+/g)[0];
	return mentionTemplate?.match(/\d+/)[0];
}
