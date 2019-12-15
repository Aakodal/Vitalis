import { Message, RichEmbed } from "discord.js";
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

export default class Ban extends Command {
	constructor() {
		super({
			name: "ban",
			description: "Ban a member with a specified reason",
			usage: "ban <member mention> [duration] <reason>",
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const id = args[0].slice(3, args[0].length - 1);
		const member = message.mentions.members.get(id);

		if (!member) return sendError("Member not found.", message.channel);

		if (!canSanction(member, message.member, message.channel, "ban")) return;

		const banned = await message.guild.fetchBans(false);

		if (banned.get(member.id)) return sendError("This member is already banned.", message.channel);

		const [durationString, duration, reason, embedDescription, DMDescription] = getSanctionValues(args, "banned", member);
		const durationNumber = Number(duration);
		const reasonText = String(reason);

		if (durationNumber && !args[2]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const banEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_green)
			.setTitle("Ban")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL);

		await message.channel.send(banEmbed);

		await member.user.send(banEmbed.setDescription(DMDescription));

		await member.ban({ days: 7, reason: reasonText });

		await log("modlog", banEmbed);

		const memberID = member.user.id;

		const created = Date.now();

		const expiration = duration
			? created + durationNumber
			: null;

		await db
			.insert({
				discord_id: memberID,
				infraction: reasonText,
				type: "ban",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.tag,
			})
			.into("infractions");

		await verifUserInDB(memberID);

		await db.update({
			pseudo: member.user.tag,
			actual_sanction: "banned",
			created,
			expiration,
		}).into("users").where({ discord_id: memberID });

		if (!duration) return;

		longTimeout(async () => {
			await unsanction(memberID, message.guild, "banned", false);
		}, expiration - created);
	}
}
