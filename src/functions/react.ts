import { Message } from "discord.js";

export async function react(emojis: string | string[], message: Message) {
	for (const emoji of emojis) {
		try {
			await message.react(emoji);
		} catch {}
	}
}
