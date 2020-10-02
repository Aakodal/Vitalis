import { ClientUser, Guild, GuildMember, MessageEmbed, Role, Snowflake, User } from "discord.js";

import { ArgumentError } from "../exceptions/ArgumentError";
import { MemberError } from "../exceptions/MemberError";
import { PermissionError } from "../exceptions/PermissionError";
import { UsageError } from "../exceptions/UsageError";
import { client } from "../index";
import { COLORS } from "../misc/constants";
import { db, userExistsInDB } from "../misc/database";
import { fetchMember } from "./fetchMember";
import { getDurationFromString } from "./getDurationFromString";
import { log } from "./log";
import { longTimeout } from "./longTimeout";
import { getMuteRole } from "./muteRole";

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

export function getSanctionValues(
	args: string[],
	sanction: string,
	member: User,
	guild: Guild,
): (string | number | null)[] {
	const isPermanent = !args[1].match(/^[1-9]+([smhdwy]|mo)$/i);

	const durationString = isPermanent ? null : args.slice(1, 2).toString().toLowerCase();

	const duration = durationString ? getDurationFromString(durationString) : null;

	const reason = duration ? args.slice(2).join(" ") : args.slice(1).join(" ");

	const embedDescription = duration
		? `${member} has been ${sanction} for ${durationString} for the following reason:\n\n${reason}`
		: `${member} has been permanently ${sanction} for the following reason:\n\n${reason}`;

	const dmDescription = duration
		? `You have been ${sanction} from ${guild.name} for ${durationString} for the following reason:\n\n${reason}`
		: `You have been permanently ${sanction} from ${guild.name} for the following reason:\n\n${reason}`;

	return [durationString, duration, reason, embedDescription, dmDescription];
}

export async function unsanction(
	id: Snowflake,
	server: Guild,
	sanction: string,
	forced = false,
): Promise<number | NodeJS.Timeout | void> {
	await userExistsInDB(id, server);
	const user = (await db.from("users").where({ server_id: server.id, discord_id: id, actual_sanction: sanction }))[0];

	if (!user) {
		return;
	}

	const { expiration } = user;
	const now = Date.now();

	if (expiration && now < expiration && !forced) {
		return longTimeout(() => {
			unsanction(id, server, sanction);
		}, expiration - now);
	}

	const baseEmbed = new MessageEmbed()
		.setAuthor("Moderation", server.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.lightGreen)
		.setTimestamp();

	const autoEmbed = new MessageEmbed(baseEmbed)
		.setColor(COLORS.gold)
		.setDescription(`[AUTO] ${user.pseudo} has been un${sanction} (sanction timeout).`);

	if (sanction === "muted") {
		const member = await fetchMember(server, id);
		const muteRole = await getMuteRole(server);

		if (member && muteRole && member.roles.cache.get(muteRole.id)) {
			await member.roles.remove(muteRole);
		}

		await db
			.update({
				actual_sanction: null,
				created: null,
				expiration: null,
			})
			.into("users")
			.where({ server_id: server.id, discord_id: id });

		const unmuteEmbed = new MessageEmbed(baseEmbed)
			.setTitle("Unmute")
			.setDescription(`You have been unmuted from ${server.name}.`);
		await user.send(unmuteEmbed);

		if (!forced) {
			await log("mod_log", autoEmbed, server);
		}

		return;
	}
	// else
	const bans = await server.fetchBans();
	if (!bans.get(id)) {
		return;
	}

	await server.members.unban(id, "[AUTO] Sanction finished.");
	await db
		.update({
			actual_sanction: null,
			created: null,
			expiration: null,
		})
		.into("users")
		.where({ server_id: server.id, discord_id: id });

	if (!forced) {
		await log("mod_log", autoEmbed, server);
	}
}
