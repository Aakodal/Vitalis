import { DMChannel, Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class MessageUpdate extends Event {
	constructor(client: Client) {
		super("messageUpdate", client);
	}

	async listener(oldMessage: Message, newMessage: Message): Promise<void> {
		if (!this.client.operational || !newMessage.guild) {
			return;
		}

		if (oldMessage.partial) {
			await oldMessage.fetch();
		}

		if (newMessage.partial) {
			await newMessage.fetch();
		}

		if (
			newMessage.author.bot ||
			newMessage.channel instanceof DMChannel ||
			oldMessage.content === newMessage.content
		) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: newMessage.guild.id });

		if (!logsActive) {
			return;
		}

		const oldContent =
			oldMessage.content.length > 1000 ? `${oldMessage.content.slice(0, 1000)}...` : oldMessage.content;
		const newContent =
			newMessage.content.length > 1000 ? `${newMessage.content.slice(0, 1000)}...` : newMessage.content;
		const embed = new MessageEmbed()
			.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL({ dynamic: true }))
			.setDescription(`**Message updated in ${newMessage.channel} ([jump](${newMessage.url}))**`)
			.setColor(COLORS.gold)
			.setTimestamp(Date.now());

		if (oldContent.length !== 0) {
			embed.addField(`**Old content**`, oldContent, false);
		}

		if (newContent.length !== 0) {
			embed.addField(`**New content**`, newContent, false);
		}

		await log("log", embed, newMessage.guild, this.client);
	}
}
