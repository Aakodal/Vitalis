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

export default class Ban extends Command {
	constructor() {
		super({
			name: "ban",
			description: "Ban a member with a specified reason",
			category: "Moderation",
			usage: "ban <user ID | user mention> [duration] <reason>",
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await fetchUser(userSnowflake);

		if (!user) throw new UserError();

		if (!await canSanction(user, message.member, "ban")) return;

		const banned = await message.guild.fetchBans();

		if (banned.get(user.id)) throw new SanctionError("This user is already banned.");

		const [
			durationString, duration, reason, embedDescription, DMDescription,
		] = getSanctionValues(args, "banned", user, message.guild);
		const durationNumber = Number(duration);
		const reasonText = String(reason);

		if (durationNumber && !args[2]) throw new UsageError(`Wrong command usage. Usage: ${this.informations.usage}`);

		const banEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.lightGreen)
			.setTitle("Ban")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		const member = await fetchMember(message.guild, user);

		if (member) {
			if (!member.bannable) throw new SanctionError("For some reason, this member can not be banned.");
			try {
				await user.send(banEmbed.setDescription(DMDescription));
			} catch (error) {
				console.info("Could not DM the banned user.");
			}
		}

		try {
			await message.guild.members.ban(user, { days: 7, reason: reasonText });
		} catch (error) {
			throw new SanctionError(`This user couldn't have been banned; ${error.message}`);
		}

		await message.channel.send(banEmbed);

		await log("modlog", banEmbed);

		const userID = user.id;

		const created = Date.now();

		const expiration = duration
			? created + durationNumber
			: null;

		await db
			.insert({
				discord_id: userID,
				infraction: reasonText,
				type: "ban",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(userID);

		await db.update({
			pseudo: user.tag,
			actual_sanction: "banned",
			created,
			expiration,
		}).into("users").where({ discord_id: userID });

		if (!duration) return;

		longTimeout(async () => {
			await unsanction(userID, message.guild, "banned", false);
		}, expiration - created);
	}
}
