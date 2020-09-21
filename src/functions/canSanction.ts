import { ClientUser, GuildMember, Role, Snowflake, User } from "discord.js";

import { ArgumentError } from "../exceptions/ArgumentError";
import { MemberError } from "../exceptions/MemberError";
import { PermissionError } from "../exceptions/PermissionError";
import { UsageError } from "../exceptions/UsageError";
import { client } from "../index";
import { fetchMember } from "./fetchMember";

export async function canSanction(
	user: GuildMember | User | Snowflake,
	author: GuildMember,
	sanction: string,
): Promise<boolean> {
	if (!user) {
		throw new ArgumentError("Please mention the user or provide their ID. Note that they must be on the server.");
	}

	if (user === author) {
		throw new UsageError(`You can't ${sanction} yourself.`);
	}

	if (sanction === "ban" || sanction === "unban") {
		return true;
	}
	// return since ban and unban are two commands which can be used on non-guildmembers

	const member = await fetchMember(author.guild, user);

	if (!member) {
		throw new MemberError(`Member not found.`);
	}

	const clientMember = await fetchMember(author.guild, client.user as ClientUser);

	if (
		member?.roles.highest.comparePositionTo(clientMember?.roles.highest as Role) >= 0 ||
		member?.roles.highest.comparePositionTo(author.roles.highest) >= 0
	) {
		throw new PermissionError(`You can't ${sanction} someone who is superior or equal to you or to me.`);
	}

	return true;
}
