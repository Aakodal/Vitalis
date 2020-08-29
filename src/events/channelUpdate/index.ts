import {
	GuildChannel, MessageEmbed, TextChannel, Channel,
} from "discord.js";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";
import { Event } from "../../classes/Event";
import { Client } from "../../classes/Client";

export default class Command extends Event {
	constructor(client: Client) {
		super("channelCreate", client);
	}

	async listener(oldChannel: Channel, newChannel: Channel): Promise<void> {
		if (
			!this.client.operational
			|| !(oldChannel instanceof GuildChannel)
			|| !(newChannel instanceof GuildChannel)
		) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: newChannel.guild.id });

		if (!logsActive) {
			return;
		}

		const newTextChannel = newChannel as TextChannel;
		const oldTextChannel = oldChannel as TextChannel;

		const channelReference = newChannel.type !== "voice" && newChannel.type !== "category"
			? newChannel
			: newChannel.name;

		const embed = new MessageEmbed()
			.setAuthor("Channel Updated", newChannel.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.gold)
			.addField("**Channel**", channelReference, true)
			.addField("**Type**", newChannel.type, true)
			.setTimestamp(Date.now());

		if (oldChannel.name !== newChannel.name) {
			embed.addField("**Old name**", oldChannel.name);
		}

		if (oldTextChannel.topic !== newTextChannel.topic) {
			if (oldTextChannel.topic) {
				embed.addField("**Old topic**", oldTextChannel.topic);
			}
			if (newTextChannel.topic) {
				embed.addField("**New topic**", newTextChannel.topic);
			}
		}

		if (oldChannel.parent !== newChannel.parent) {
			embed
				.addField("**Old parent**", oldChannel.parent, false)
				.addField("**New parent**", newChannel.parent, true);
		}

		if (oldTextChannel.nsfw !== newTextChannel.nsfw) {
			embed
				.addField("**Old NSFW state**", oldTextChannel.nsfw, false)
				.addField("**New NSFW state**", newTextChannel.nsfw, true);
		}

		if (embed.fields.length === 2) {
			return;
		}

		await log("log", embed, newChannel.guild);
	}
}
