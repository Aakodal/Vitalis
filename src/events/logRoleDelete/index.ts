import { MessageEmbed, Role } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class RoleDelete extends Event {
	constructor(client: Client) {
		super("roleDelete", client);
	}

	async listener(role: Role): Promise<void> {
		if (!this.client.operational || !role.guild) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: role.guild.id });

		if (!logsActive) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor("Role Deleted", role.guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightRed)
			.setTitle(role.name)
			.setTimestamp(Date.now());

		await log("log", embed, role.guild);
	}
}
