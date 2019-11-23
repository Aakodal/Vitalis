import { GuildMember } from "discord.js";
import { getDurationFromString } from "./getDurationFromString";

export function getSanctionValues(args: string[], sanction: string, member: GuildMember) {
	const isPermanent = !args[1].match(/^[0-9]+([smhdwy]|mo)$/i);

	const durationString = isPermanent
		? null
		: args.slice(1, 2).toString().toLowerCase();

	const duration = durationString
		? getDurationFromString(durationString)
		: null;

	const reason = duration
		? args.slice(2).join(" ")
		: args.slice(1).join(" ");

	const embedDescription = duration
		? `${member.user} has been ${sanction} for ${durationString} for the following reason:\n\n${reason}`
		: `${member.user} has been permanently ${sanction} for the following reason:\n\n${reason}`;

	const DMDescription = duration
		? `You have been permanently ${sanction} for the following reason:\n\n${reason}`
		: `You have been ${sanction} for ${durationString} for the following reason:\n\n${reason}`;

	return [durationString, duration, reason, embedDescription, DMDescription];
}
