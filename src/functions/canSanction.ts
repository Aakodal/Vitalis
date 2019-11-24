import { GuildMember, Snowflake, User } from "discord.js";
import { client } from "../main";
import { sendError } from "./sendError";
import { MessageChannel } from "../typings";

export function canSanction(
	user: GuildMember | User | Snowflake, author: GuildMember, channel: MessageChannel, sanction: string,
): boolean {
	if (!user) {
		sendError("Please mention the member. Note that they must be on the server.", channel);
		return false;
	}
	if (user === author) {
		sendError(`You can't ${sanction} yourself.`, channel);
		return false;
	}

	const member = user instanceof GuildMember
		? author.guild.member(user)
		: null;

	const clientMember = author.guild.member(client.user);

	if (member?.highestRole.comparePositionTo(clientMember.highestRole) >= 0
		|| member?.highestRole.comparePositionTo(author.highestRole) >= 0) {
		sendError(
			`You can't ${sanction} someone who is superior or equal to you or to me.`,
			channel,
		);
		return false;
	}

	return true;
}
