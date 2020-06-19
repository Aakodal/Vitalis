import { Guild, Role, Snowflake } from "discord.js";

export function fetchRole(guild: Guild, id: Snowflake): Role {
	try {
		return guild.roles.cache.get(id);
	} catch {}
}
