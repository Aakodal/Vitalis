import { DMChannel, Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class MessageDelete extends Event {
	constructor(client: Client) {
		super("messageDelete", client);
	}

	async listener(message: Message): Promise<void> {
		if (!this.client.operational || !message.guild || message.partial || message.channel instanceof DMChannel) {
			// cannot get informations from uncached messages
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: message.guild.id });

		if (!logsActive || message.author.bot) {
			return;
		}

		const content = message.content.length > 1000 ? `${message.content.slice(0, 1000)}...` : message.content;
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
			.setDescription(`**Message deleted in ${message.channel}**`)
			.setColor(COLORS.lightRed)
			.setTimestamp(Date.now());

		if (content.length !== 0) {
			embed.addField(`**Content**`, content, false);
		}

		if (message.attachments.size > 0) {
			embed.addField(
				"**Attachments**",
				[...message.attachments.values()].map((attachment) => attachment.name).join(", "),
				true,
			);
		}

		await log("log", embed, message.guild, this.client);
	}
}
