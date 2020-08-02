import { ClientUser, Guild, Role } from "discord.js";
import { client } from "../index";
import { pushValueInDB } from "./pushValueInDB";

export async function createMuteRole(server: Guild): Promise<Role> {
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
