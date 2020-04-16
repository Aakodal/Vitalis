import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { getSanctionValues } from "../../functions/getSanctionValues";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { sendError } from "../../functions/sendError";
import { unsanction } from "../../functions/unsanction";
import { canSanction } from "../../functions/canSanction";
import { longTimeout } from "../../functions/longTimeout";
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";

export default class Ban extends Command {
	constructor() {
		super({
			name: "ban",
			description: "Ban a member with a specified reason",
			usage: "ban <user ID | user mention> [duration] <reason>",
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const userSnowflake = getUserSnowflakeFromString(args[0]);
		const user = await client.users.fetch(userSnowflake);

		if (!user) return sendError("User not found.", message.channel);

		if (user.partial) await user.fetch();

		if (!await canSanction(user, message.member, message.channel, "ban")) return;

		const banned = await message.guild.fetchBans();

		if (banned.get(user.id)) return sendError("This user is already banned.", message.channel);

		const [durationString, duration, reason, embedDescription, DMDescription] = getSanctionValues(args, "banned", user, message.guild);
		const durationNumber = Number(duration);
		const reasonText = String(reason);

		if (durationNumber && !args[2]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const banEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.light_green)
			.setTitle("Ban")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		const member = await message.guild.members.cache.get(userSnowflake);

		if (member) {
			if (!member.bannable) return sendError("For some reason, this member can not be banned.", message.channel);
			try {
				await user.send(banEmbed.setDescription(DMDescription));
			} catch (error) {
				console.info("Could not DM the banned user.");
			}
		}

		try {
			await message.guild.members.ban(user, { days: 7, reason: reasonText });
		} catch (error) {
			return sendError(`For some reason, this user couldn't have been banned;\n\n${error}`, message.channel);
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
				moderator: message.author.tag,
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
