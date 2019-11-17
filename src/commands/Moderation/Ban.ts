import { Message, RichEmbed } from "discord.js";
import { Command } from "../../lib/Command";
import { Client } from "../../lib/Client";
import {
	sendError, verifUserInDB, canSanction, unsanction, getSanctionValues,
} from "../../lib/functions";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";

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

		const member = message.mentions.members.first();

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
			.setTimestamp();

		await message.channel.send(banEmbed);

		// TODO: add mod logging here (adding the moderator)

		await member.user.send(banEmbed.setDescription(DMDescription));

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

		await member.ban({ days: 7, reason: reasonText });

		setTimeout(async () => {
			await unsanction(memberID, message.guild, "banned", false);
		}, expiration - created);
	}
}
