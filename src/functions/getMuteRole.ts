import { Guild } from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "./getValueFromDB";
import { pushValueInDB } from "./pushValueInDB";

export async function getMuteRole(server: Guild) {
	const muteRoleDB = server.roles.get(await getValueFromDB("server", "muteRoleID"));
	if (!muteRoleDB) {
		const botRole = server.member(client.user).highestRole;
		const highestRolePosition = botRole.calculatedPosition;
		const muteRole = await server.createRole({
			name: "Muted",
			color: 0x000001,
			hoist: false,
			position: highestRolePosition - 1,
			permissions: ["VIEW_CHANNEL", "CONNECT", "READ_MESSAGE_HISTORY"],
			mentionable: false,
		}, "[AUTO] Mute role not found, created");
		await pushValueInDB("server", "muteRoleID", muteRole.id);
	}

	const muteRole = server.roles.get(await getValueFromDB("server", "muteRoleID"));
	server.channels.forEach((channel) => {
		if (!channel.permissionOverwrites.get(muteRole.id)) {
			channel.overwritePermissions(muteRole, {
				ADD_REACTIONS: false,
				ATTACH_FILES: false,
				SEND_MESSAGES: false,
				SEND_TTS_MESSAGES: false,
				SPEAK: false,
			});
		}
	});

	return muteRole;
}
