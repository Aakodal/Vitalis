import { Guild, Role } from "discord.js";

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
