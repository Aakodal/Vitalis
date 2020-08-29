import { GuildChannel, MessageEmbed, Channel } from "discord.js";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";
import { Event } from "../../classes/Event";
import { Client } from "../../classes/Client";

export default class Command extends Event {
	constructor(client: Client) {
		super("channelCreate", client);
	}

	async listener(channel: Channel): Promise<void> {
		if (!this.client.operational || !(channel instanceof GuildChannel)) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: channel.guild.id });

		if (!logsActive) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor("Channel Deleted", channel.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightRed)
			.addField("**Channel**", channel.name, true)
			.addField("**Type**", channel.type, true)
			.setTimestamp(Date.now());

		await log("log", embed, channel.guild);
	}
}
