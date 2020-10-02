import { Invite, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { formatDate } from "../../functions/formatDate";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class InviteCreate extends Event {
	constructor(client: Client) {
		super("inviteCreate", client);
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
			.setAuthor("Invite Created", invite.guild.iconURL({ dynamic: true }) as string, invite.url)
			.setColor(COLORS.lightGreen)
			.addField("**Code**", invite.code, true)
			.addField("**Creator**", invite.inviter?.toString() || "Unknown", true)
			.addField("**Max uses**", invite.maxUses || "Unlimited", true)
			.addField("**Expires**", invite.expiresAt ? formatDate(invite.expiresAt) : "Never", true)
			.setTimestamp(Date.now());

		await log("log", embed, invite.guild);
	}
}
