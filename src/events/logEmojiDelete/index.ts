import { GuildEmoji, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class EmojiDelete extends Event {
	constructor(client: Client) {
		super("emojiDelete", client);
	}

	async listener(emoji: GuildEmoji): Promise<void> {
		if (!this.client.operational) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: emoji.guild.id });

		if (!logsActive) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor("Emoji Deleted", emoji.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightRed)
			.setThumbnail(emoji.url)
			.addField("**Name**", emoji.name, true)
			.setTimestamp(Date.now());

		await log("log", embed, emoji.guild);
	}
}
