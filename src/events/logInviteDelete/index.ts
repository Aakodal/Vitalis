import { Invite, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

export default class InviteDelete extends Event {
	constructor(client: Client) {
		super("inviteDelete", client);
	}

	async listener(invite: Invite): Promise<void> {
		if (!this.client.operational || !invite.guild) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: invite.guild.id });

		if (!logsActive) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor("Invite Deleted", invite.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightRed)
			.addField("**Code**", invite.code, true)
			.setTimestamp(Date.now());

		await log("log", embed, invite.guild);
	}
}
