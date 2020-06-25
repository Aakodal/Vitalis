import { Guild, GuildMember, UserResolvable } from "discord.js";

export async function fetchMember(guild: Guild, user: UserResolvable): Promise<GuildMember> {
	try {
		return await guild.members.fetch(user || "1");
	} catch {}
}
