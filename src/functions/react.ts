import { Message } from "discord.js";

export async function react(emojis: string | string[], message: Message): Promise<void> {
	for (const emoji of emojis) {
		try {
			await message.react(emoji);
		} catch {}
	}
}
