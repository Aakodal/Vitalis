import { GuildMember, Snowflake, User } from "discord.js";
import { client } from "../main";
import { sendError } from "./sendError";
import { MessageChannel } from "../typings";
import { fetchMember } from "./fetchMember";

export async function canSanction(
	user: GuildMember | User | Snowflake, author: GuildMember, channel: MessageChannel, sanction: string,
) {
	if (!user) {
		sendError("Please mention the user. Note that they must be on the server.", channel);
		return false;
	}

	if (user === author) {
		sendError(`You can't ${sanction} yourself.`, channel);
		return false;
	}

	if (sanction === "ban" || sanction === "unban") return true;
	// return since ban and unban are two commands which can be used on non-guildmembers

	const member = await fetchMember(author.guild, user);

	if (!member) {
		sendError(`Member not found.`, channel);
		return false;
	}

	const clientMember = await fetchMember(author.guild, client.user);

	if (member?.roles.highest.comparePositionTo(clientMember.roles.highest) >= 0
		|| member?.roles.highest.comparePositionTo(author.roles.highest) >= 0) {
		sendError(
			`You can't ${sanction} someone who is superior or equal to you or to me.`,
			channel,
		);
		return false;
	}

	return true;
}
