import { Guild, Role } from "discord.js";

export async function configMuteRole(server: Guild, muteRole: Role) {
	const channels = server.channels.cache.array();
	for (const channel of channels) {
		if (!channel.permissionOverwrites.get(muteRole.id)) {
			await channel.overwritePermissions([
				{
					id: muteRole.id,
					deny: ["ADD_REACTIONS", "ATTACH_FILES", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "SPEAK", "STREAM"],
				},
			], "[AUTO] Configuring mute role");
		}
	}
}
