import { Message, RichEmbed } from "discord.js";
import { Command } from "../../lib/Command";
import { Client } from "../../lib/Client";
import {
	sendError, verifUserInDB, canSanction, getMuteRole, unsanction, getSanctionValues,
} from "../../lib/functions";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";

export default class Mute extends Command {
	constructor() {
		super({
			name: "mute",
			description: "Mute a member with a specified reason",
			usage: "mute <member mention> [duration] <reason>",
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const member = message.mentions.members.first();

		const muteRole = await getMuteRole(message.guild);

		if (member.user.bot) return sendError("You can't mute a bot.", message.channel);

		if (!canSanction(member, message.member, message.channel, "mute")) return;

		if (member.roles.get(muteRole.id)) return sendError("This member is already muted.", message.channel);

		const [durationString, duration, reason, embedDescription, DMDescription] = getSanctionValues(args, "muted", member);
		const durationNumber = Number(duration);

		if (durationNumber && !args[2]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const muteEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_green)
			.setTitle("Mute")
			.setDescription(embedDescription)
			.setTimestamp();

		await message.channel.send(muteEmbed);

		// TODO: add mod logging here (adding the moderator)

		await member.user.send(muteEmbed.setDescription(DMDescription));

		await member.addRole(muteRole);

		const memberID = member.user.id;

		const created = Date.now();

		const expiration = duration
			? created + durationNumber
			: null;

		await db
			.insert({
				discord_id: memberID,
				infraction: reason,
				type: "mute",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.tag,
			})
			.into("infractions");

		await verifUserInDB(memberID);

		await db.update({
			pseudo: member.user.tag,
			actual_sanction: "muted",
			created,
			expiration,
		}).into("users").where({ discord_id: memberID });

		if (!duration) return;

		setTimeout(async () => {
			await unsanction(memberID, message.guild, "muted", false);
		}, expiration - created);
	}
}
