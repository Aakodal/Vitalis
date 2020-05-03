import { Guild, UserResolvable } from "discord.js";

export async function fetchMember(guild: Guild, user: UserResolvable) {
	try {
		return await guild.members.fetch(user);
	} catch (error) {
		return undefined;
	}
}
