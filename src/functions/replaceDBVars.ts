import { Guild, GuildMember } from "discord.js";
import { getValueFromDB } from "./getValueFromDB";

export async function replaceDBVars(message: string, options?: {server: Guild, member: GuildMember}): Promise<string> {
	const prefix = await getValueFromDB<string>("server", "prefix");

	return message
		.replace("{PREFIX}", prefix)
		.replace("{SERVER}", options?.server?.name)
		.replace("{MENTION}", `<@${options?.member?.id}>`)
		.replace("{USER}", options?.member?.user.tag);
}
