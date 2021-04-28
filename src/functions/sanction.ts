import { ClientUser, Guild, GuildMember, Role, Snowflake, User } from "discord.js";

import { Client } from "../classes/Client";
import { ArgumentError } from "../exceptions/ArgumentError";
import { MemberError } from "../exceptions/MemberError";
import { PermissionError } from "../exceptions/PermissionError";
import { UsageError } from "../exceptions/UsageError";
import { DURATION_REGEXP } from "../misc/constants";
import { getDuration, getTimeFromString } from "./duration";

export async function canSanction(
	user: GuildMember | User | Snowflake,
	author: GuildMember,
	sanction: string,
	client: Client,
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

	const member = await client.fetchMember(author.guild, user);

	if (!member) {
		throw new MemberError(`Member not found.`);
	}

	const clientMember = await client.fetchMember(author.guild, client.user as ClientUser);

	if (
		member?.roles.highest.comparePositionTo(clientMember?.roles.highest as Role) >= 0 ||
		member?.roles.highest.comparePositionTo(author.roles.highest) >= 0
	) {
		throw new PermissionError(`You can't ${sanction} someone who is superior or equal to you or to me.`);
	}

	return true;
}

export function getSanctionValues(
	args: string[],
	sanction: string,
	member: User,
	guild: Guild,
): (string | number | undefined)[] {
	const isPermanent = !args[1].match(DURATION_REGEXP);

	const timeString = getTimeFromString(args[1]);
	const durationString = isPermanent ? undefined : `${timeString?.integer}${timeString?.time}`;

	const duration = durationString ? getDuration(durationString) : undefined;

	const reason = duration ? args.slice(2).join(" ") : args.slice(1).join(" ");

	const embedDescription = duration
		? `${member} has been ${sanction} for ${durationString} for the following reason:\n\n${reason}`
		: `${member} has been permanently ${sanction} for the following reason:\n\n${reason}`;

	const dmDescription = duration
		? `You have been ${sanction} from ${guild.name} for ${durationString} for the following reason:\n\n${reason}`
		: `You have been permanently ${sanction} from ${guild.name} for the following reason:\n\n${reason}`;

	return [durationString, duration, reason, embedDescription, dmDescription];
}
