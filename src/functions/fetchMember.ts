import { Guild, GuildMember, UserResolvable } from "discord.js";

export async function fetchMember(guild: Guild, user: UserResolvable): Promise<GuildMember> {
	if (!user) {
		return null;
	}

	try {
		return guild.members.fetch(user || "1");
	} catch {}
}
