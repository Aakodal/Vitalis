import {
	DMChannel, Snowflake, TextChannel, PermissionResolvable, NewsChannel,
} from "discord.js";

type MessageChannel = TextChannel | DMChannel | NewsChannel;
type CommandPermission = PermissionResolvable | "BOT_OWNER";

interface Infraction {
	id: number,
	discord_id: Snowflake,
	infraction: string,
	type: "warn" | "mute" | "kick" | "ban",
	created: number,
	expiration: number,
	duration: string,
	moderator: string,
}

type CommandInformations = {
	name: string,
	description?: string,
	usage?: string,
	aliases?: string[],
	permission?: CommandPermission,
	category?: string,
	commandFile?: string,
};
