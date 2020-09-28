import { GuildEmoji, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

export default class EmojiCreate extends Event {
	constructor(client: Client) {
		super("emojiCreate", client);
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
			.setAuthor("Emoji Created", emoji.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setThumbnail(emoji.url)
			.addField("**Name**", emoji.name, true)
			.addField("**Author**", (await emoji.fetchAuthor())?.toString() || "Unknown", true)
			.setTimestamp(Date.now());

		await log("log", embed, emoji.guild);
	}
}
