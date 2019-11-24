import {
	DMChannel, GroupDMChannel, Snowflake, TextChannel,
} from "discord.js";

type MessageChannel = TextChannel | DMChannel | GroupDMChannel;
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
