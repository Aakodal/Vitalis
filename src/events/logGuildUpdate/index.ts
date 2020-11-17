import { Guild, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { capitalize } from "../../functions/capitalize";
import { log } from "../../functions/log";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class GuildUpdate extends Event {
	constructor(client: Client) {
		super("guildUpdate", client);
	}

	async listener(oldGuild: Guild, newGuild: Guild): Promise<void> {
		if (!this.client.operational) {
			return;
		}

		const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: newGuild.id });

		if (!logsActive) {
			return;
		}

		if (
			oldGuild.afkChannelID === newGuild.afkChannelID &&
			oldGuild.afkTimeout === newGuild.afkTimeout &&
			oldGuild.description === newGuild.description &&
			oldGuild.name === newGuild.name &&
			oldGuild.owner === newGuild.owner &&
			oldGuild.rulesChannelID === newGuild.rulesChannelID &&
			oldGuild.vanityURLCode === newGuild.vanityURLCode &&
			oldGuild.verificationLevel === newGuild.verificationLevel &&
			oldGuild.bannerURL() === newGuild.bannerURL() &&
			oldGuild.iconURL() === newGuild.iconURL()
		) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor("Guild Updated", newGuild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.gold)
			.setTimestamp(Date.now());

		if (oldGuild.afkChannelID !== newGuild.afkChannelID) {
			embed
				.addField("**Old AFK channel**", oldGuild.afkChannel?.toString() || "None", true)
				.addField("**New AFK channel**", newGuild.afkChannel?.toString() || "None", true);
		}

		if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
			const oldTimeout = oldGuild.afkTimeout / 60;
			const newTimeout = newGuild.afkTimeout / 60;
			embed
				.addField("**Old AFK timeout**", `${oldTimeout} minute${oldTimeout > 1 ? "s" : ""}`, true)
				.addField("**New AFK timeout**", `${newTimeout} minute${newTimeout > 1 ? "s" : ""}`, true);
		}

		if (oldGuild.description !== newGuild.description) {
			embed
				.addField("**Old description**", oldGuild.description || "None", true)
				.addField("**New description**", newGuild.description || "None", true);
		}

		if (oldGuild.name !== newGuild.name) {
			embed.addField("**Old name**", oldGuild.name, true).addField("**New name**", newGuild.name, true);
		}

		if (oldGuild.owner !== newGuild.owner) {
			// Guild#owner is marked as nullable but it is the case only if GUILD_MEMBER partial is not activated, so we do not care here
			embed.addField("**Old owner**", oldGuild.owner, true).addField("**New Owner**", newGuild.owner, true);
		}

		if (oldGuild.rulesChannelID !== newGuild.rulesChannelID) {
			embed
				.addField("**Old rules channel**", oldGuild.rulesChannel?.toString() || "None", true)
				.addField("**New rules channel**", newGuild.rulesChannel?.toString() || "None", true);
		}

		if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
			embed
				.addField("**Old vanity invite**", oldGuild.vanityURLCode || "None", true)
				.addField("**New vanity invite**", newGuild.vanityURLCode || "None", true);
		}

		if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
			embed
				.addField("**Old verification level**", capitalize(oldGuild.verificationLevel), true)
				.addField("**New verification level**", capitalize(newGuild.verificationLevel), true);
		}

		if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
			embed.addField("**New banner**", newGuild.bannerURL() || "None");
		}

		if (oldGuild.iconURL() !== newGuild.iconURL()) {
			embed.addField("**New icon**", newGuild.iconURL({ dynamic: true }) || "None");
		}

		await log("log", embed, newGuild, this.client);
	}
}
