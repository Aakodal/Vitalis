import { GuildMember, Snowflake, User } from "discord.js";
import { client } from "../main";
import { sendError } from "./sendError";
import { MessageChannel } from "../typings";

export async function canSanction(
	user: GuildMember | User | Snowflake, author: GuildMember, channel: MessageChannel, sanction: string,
): Promise<boolean> {
	if (!user) {
		sendError("Please mention the member. Note that they must be on the server.", channel);
		return false;
	}

	if (user === author) {
		sendError(`You can't ${sanction} yourself.`, channel);
		return false;
	}

	if (sanction === "ban" || sanction === "unban") return true; // return since ban and unban are two commands which can be used on non-guildmembers

	const member = author.guild.member(user);

	if (!member) {
		sendError(`Member not found.`, channel);
		return false;
	}

	if (member.partial) await member.fetch();

	const clientMember = author.guild.member(client.user);

	if (clientMember.partial) await clientMember.fetch();

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
