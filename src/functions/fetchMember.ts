import { Guild, Snowflake } from "discord.js";

export async function fetchMember(guild: Guild, id: Snowflake | string) {
	try {
		return await guild.members.fetch(id);
	} catch (error) {
		return undefined;
	}
}
