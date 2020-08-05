import { Guild, MessageEmbed, TextChannel } from "discord.js";
import { client } from "../index";
import { getValueFromDB } from "./getValueFromDB";

export async function log(type: "log" | "mod_log", embed: MessageEmbed, server: Guild): Promise<void> {
	const channelId = await getValueFromDB<string>("servers", `${type}s_channel`, { server_id: server.id });
	const isActive = await getValueFromDB<boolean>("servers", `${type}s_active`, { server_id: server.id });

	if (!channelId || !isActive) {
		return;
	}

	const channel = (await client.channels.fetch(channelId)) as TextChannel;

	if (!channel) {
		return;
	}

	if (channel.guild !== server) {
		return console.error(
			`Provided log channel belongs to ${channel.guild.name} (${channel.guild.id}) \
			but has been called from ${server.name} (${server.id}).`,
		);
	}

	try {
		await channel.send(embed);
	} catch {}
}
