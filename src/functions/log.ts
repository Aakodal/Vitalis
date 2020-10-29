import { Guild, MessageOptions, TextChannel } from "discord.js";

import { client } from "../index";
import { getValueFromDB } from "../misc/database";

export async function log(type: "log" | "mod_log", message: MessageOptions, server: Guild): Promise<void> {
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
		server.owner
			?.send(
				`Provided log channel belongs to ${channel.guild.name} (${channel.guild.id}) but has been called \
from your server ${server.name} (${server.id}). Please update bot's configuration using \`configedit\` command`, // TODO: update as soon as string dedent is added
			)
			.catch(() => {});
	}

	channel.send(message).catch(() => {});
}
