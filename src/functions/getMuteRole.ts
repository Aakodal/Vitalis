import { Guild } from "discord.js";
import { getValueFromDB } from "./getValueFromDB";
import { createMuteRole } from "./createMuteRole";
import { configMuteRole } from "./configMuteRole";

export async function getMuteRole(server: Guild) {
	const muteRoleDB = await server.roles.fetch(await getValueFromDB("server", "muteRoleID") || "1");

	const muteRole = muteRoleDB || await createMuteRole(server);
	await configMuteRole(server, muteRole);

	return muteRole;
}
