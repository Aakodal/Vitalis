import { Guild, GuildChannel, Snowflake } from "discord.js";

export function fetchGuildChannel(guild: Guild, id: Snowflake): GuildChannel | undefined {
	try {
		return guild.channels.cache.get(id);
	} catch {}
}
