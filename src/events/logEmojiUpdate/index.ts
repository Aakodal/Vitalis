import { GuildEmoji, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

export default class EmojiUpdate extends Event {
	constructor(client: Client) {
		super("emojiUpdate", client);
	}

	async listener(oldEmoji: GuildEmoji, newEmoji: GuildEmoji): Promise<void> {
		if (!this.client.operational || oldEmoji.name === newEmoji.name) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: newEmoji.guild.id });

		if (!logsActive) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor("Emoji Update", newEmoji.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.gold)
			.setThumbnail(newEmoji.url)
			.addField("**Old name**", oldEmoji.name, true)
			.addField("**New name**", newEmoji.name, true)
			.setTimestamp(Date.now());

		await log("log", embed, newEmoji.guild);
	}
}
