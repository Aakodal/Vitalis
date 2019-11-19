import { Message } from "discord.js";

export async function react(emojis: string, message: Message) {
	for (const emoji of emojis) {
		await message.react(emoji);
	}
}
