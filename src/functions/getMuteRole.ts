import { Guild } from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "./getValueFromDB";
import { pushValueInDB } from "./pushValueInDB";

export async function getMuteRole(server: Guild) {
	const muteRoleDB = server.roles.cache.get(await getValueFromDB("server", "muteRoleID"));
	if (!muteRoleDB) {
		const botRole = server.member(client.user).roles.highest;
		const highestRolePosition = botRole.position;
		const muteRole = await server.roles.create({
			data: {
				name: "Muted",
				color: 0x000001,
				hoist: false,
				position: highestRolePosition - 1,
				permissions: ["VIEW_CHANNEL", "CONNECT", "READ_MESSAGE_HISTORY"],
				mentionable: false,
			},
			reason: "[AUTO] Mute role not found, created",
		});
		await pushValueInDB("server", "muteRoleID", muteRole.id);
	}

	const muteRole = server.roles.cache.get(await getValueFromDB("server", "muteRoleID"));

	for (const channel of server.channels.cache.array()) {
		if (!channel.permissionOverwrites.get(muteRole.id)) {
			await channel.overwritePermissions([
				{
					id: muteRole.id,
					deny: ["ADD_REACTIONS", "ATTACH_FILES", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "SPEAK", "STREAM"],
				},
			], "[AUTO] Configuring mute role");
		}
	}

	return muteRole;
}
