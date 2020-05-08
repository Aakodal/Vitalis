import { Guild } from "discord.js";
import { client } from "../index";
import { pushValueInDB } from "./pushValueInDB";

export async function createMuteRole(server: Guild) {
	const botRole = server.member(client.user).roles.highest;
	const botHighestRolePosition = botRole.position;
	const muteRole = await server.roles.create({
		data: {
			name: "Muted",
			color: 0x000001,
			hoist: false,
			position: botHighestRolePosition - 1,
			permissions: ["VIEW_CHANNEL", "CONNECT", "READ_MESSAGE_HISTORY"],
			mentionable: false,
		},
		reason: "[AUTO] Mute role not found, created",
	});
	await pushValueInDB("server", "muteRoleID", muteRole.id);

	return muteRole;
}
