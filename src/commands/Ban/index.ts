import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { getSanctionValues } from "../../functions/getSanctionValues";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { unsanction } from "../../functions/unsanction";
import { canSanction } from "../../functions/canSanction";
import { longTimeout } from "../../functions/longTimeout";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchUser } from "../../functions/fetchUser";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { UserError } from "../../exceptions/UserError";
import { SanctionError } from "../../exceptions/SanctionError";
import { fetchMember } from "../../functions/fetchMember";
import { UsageError } from "../../exceptions/UsageError";
import { getValueFromDB } from "../../functions/getValueFromDB";

export default class Ban extends Command {
	constructor() {
		super({
			name: "ban",
			description: "Ban a member with a specified reason",
			category: "Moderation",
			usage: (prefix) => `${prefix}ban <user ID | user mention> [duration] <reason>`,
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild.id });

		if (!args[1]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage(prefix)}`);
		}

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await fetchUser(userSnowflake);

		if (!user) {
			throw new UserError();
		}

		if (!(await canSanction(user, message.member, "ban"))) {
			return;
		}

		const banned = await message.guild.fetchBans();

		if (banned.get(user.id)) {
			throw new SanctionError("This user is already banned.");
		}

		const [durationString, duration, reason, embedDescription, dmDescription] = getSanctionValues(
			args,
			"banned",
			user,
			message.guild,
		);
		const durationNumber = Number(duration);
		const reasonText = String(reason);

		if (durationNumber && !args[2]) {
			throw new UsageError(`Wrong command usage. Usage: ${this.informations.usage(prefix)}`);
		}

		const banEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild..iconURL({ dynamic: true }))
			.setColor(COLORS.lightGreen)
			.setTitle("Ban")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		const userEmbed = new MessageEmbed(banEmbed).setDescription(dmDescription);

		const member = await fetchMember(message.guild, user);

		if (member && !member.bannable) {
			throw new SanctionError("For some reason, this member can not be banned.");
		}

		try {
			await message.guild.members.ban(user, {
				days: 7,
				reason: reasonText,
			});
		} catch (error) {
			throw new SanctionError(`This user couldn't have been banned; ${error.message}`);
		}

		try {
			if (member) {
				await user.send(userEmbed);
			}
		} catch {}

		await message.channel.send(banEmbed);

		await log("mod_log", banEmbed, message.guild);

		const userID = user.id;

		const created = Date.now();

		const expiration = duration
			? created + durationNumber
			: null;

		await db
			.insert({
				server_id: message.guild.id,
				discord_id: userID,
				infraction: reasonText,
				type: "ban",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(userID, message.guild);

		await db
			.update({
				pseudo: user.tag,
				actual_sanction: "banned",
				created,
				expiration,
			})
			.into("users")
			.where({ server_id: message.guild.id, discord_id: userID });

		if (!duration) {
			return;
		}

		longTimeout(async () => {
			await unsanction(userID, message.guild, "banned", false);
		}, expiration - created);
	}
}
