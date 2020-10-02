import { GuildMember, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class GuildMemberAdd extends Event {
	constructor(client: Client) {
		super("guildMemberRemove", client);
	}

	async listener(member: GuildMember): Promise<void> {
		if (!this.client.operational || !member.guild) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: member.guild.id });

		if (!logsActive) {
			return;
		}

		if (member.partial) {
			await member.fetch();
		}

		const { user } = member;

		if (user.partial) {
			await user.fetch();
		}

		const embed = new MessageEmbed()
			.setAuthor("User left", user.displayAvatarURL({ dynamic: true }))
			.setColor(COLORS.lightRed)
			.setDescription(user.toString())
			.setTimestamp(Date.now());

		await log("log", embed, member.guild);
	}
}
