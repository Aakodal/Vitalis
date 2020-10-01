import { GuildMember, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

export default class GuildMemberUpdate extends Event {
	constructor(client: Client) {
		super("guildMemberUpdate", client);
	}

	async listener(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
		if (!this.client.operational || !newMember.guild) {
			return;
		}

		if (oldMember.roles.cache.size === newMember.roles.cache.size && oldMember.nickname === newMember.nickname) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: newMember.guild.id });

		if (!logsActive) {
			return;
		}

		if (newMember.partial) {
			await newMember.fetch();
		}

		const embed = new MessageEmbed()
			.setAuthor("Member Updated", newMember.user.displayAvatarURL({ dynamic: true }))
			.setDescription(newMember.toString())
			.setColor(COLORS.gold)
			.setTimestamp(Date.now());

		if (oldMember.nickname !== newMember.nickname) {
			embed
				.addField("**Old nickname**", oldMember.nickname || "*None*", true)
				.addField("**New nickname**", newMember.nickname || "*None*", true);
		}

		if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
			const roleAdded = oldMember.roles.cache.size < newMember.roles.cache.size;
			const oldRoles = [...oldMember.roles.cache.values()].map((role) => role.toString());
			const newRoles = [...newMember.roles.cache.values()].map((role) => role.toString());
			const largestRolesList = roleAdded ? newRoles : oldRoles;
			const lowestRolesList = roleAdded ? oldRoles : newRoles;

			const fieldName = roleAdded ? "**Role added**" : "**Role removed**";
			const roleUpdated = largestRolesList.filter((role) => !lowestRolesList.includes(role));

			embed.addField(fieldName, roleUpdated, false);
		}

		await log("log", embed, newMember.guild);
	}
}
