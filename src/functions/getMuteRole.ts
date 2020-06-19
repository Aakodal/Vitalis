import { Guild, Role } from "discord.js";
import { getValueFromDB } from "./getValueFromDB";
import { createMuteRole } from "./createMuteRole";
import { configMuteRole } from "./configMuteRole";

export async function getMuteRole(server: Guild): Promise<Role> {
	const muteRoleDB = await server.roles.fetch(
		(await getValueFromDB("servers", "mute_role_id", { server_id: server.id })) || "1",
	);

	const muteRole = muteRoleDB || (await createMuteRole(server));
	await configMuteRole(server, muteRole);

	return muteRole;
}
