import { ClientUser, Guild, Role } from "discord.js";

import { Client } from "../classes/Client";
import { getValueFromDB, pushValueInDB } from "../misc/database";

export async function configMuteRole(server: Guild, muteRole: Role): Promise<void> {
	const channels = server.channels.cache.array();
	for (const channel of channels) {
		if (channel.permissionOverwrites.get(muteRole.id)) {
			continue;
		}

		try {
			await channel.updateOverwrite(
				muteRole,
				{
					ADD_REACTIONS: false,
					ATTACH_FILES: false,
					SEND_MESSAGES: false,
					SEND_TTS_MESSAGES: false,
					SPEAK: false,
					STREAM: false,
				},
				"[AUTO] Configuring mute role",
			);
		} catch {}
	}
}

export async function createMuteRole(server: Guild, client: Client): Promise<Role> {
	const botRole = server.member(client.user as ClientUser)?.roles.highest;
	const botHighestRolePosition = botRole?.position;
	const muteRole = await server.roles.create({
		data: {
			name: "Muted",
			color: 0x000001,
			hoist: false,
			position: botHighestRolePosition,
			permissions: ["VIEW_CHANNEL", "CONNECT", "READ_MESSAGE_HISTORY"],
			mentionable: false,
		},
		reason: "[AUTO] Mute role not found, created",
	});
	await pushValueInDB("servers", "mute_role_id", server.id, muteRole.id);

	return muteRole;
}

export async function getMuteRole(server: Guild, client: Client): Promise<Role> {
	const muteRoleDB = await server.roles.fetch(
		(await getValueFromDB("servers", "mute_role_id", { server_id: server.id })) || "1",
	);

	const muteRole = muteRoleDB || (await createMuteRole(server, client));
	await configMuteRole(server, muteRole);

	return muteRole;
}
