import { Message, MessageEmbed } from "discord.js";
import { react } from "../../../functions/react";

export async function updateReactions(message: Message, embeds: MessageEmbed[], page: number): Promise<void> {
	if (embeds.length <= 0) {
		return;
	}

	if (page === 0) {
		await react("➡⏭", message);
	} else if (page === embeds.length - 1) {
		await react("⏮⬅", message);
	} else {
		await react("⏮⬅➡⏭", message);
	}

	await react("❌", message);
}
