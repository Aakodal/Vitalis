import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { canSanction } from "../../functions/canSanction";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchMember } from "../../functions/fetchMember";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";

export default class Kick extends Command {
	constructor() {
		super({
			name: "kick",
			description: "Kick a member with a specified reason",
			category: "Moderation",
			usage: "kick <member ID | member mention> <reason>",
			permission: "KICK_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);

		const memberSnowflake = getUserIdFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

		if (!member) throw new MemberError();

		const reason = args.slice(1).join(" ");

		if (!await canSanction(member, message.member, "kick")) return;

		const kickEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.lightRed)
			.setTitle("Kick")
			.setDescription(`${member.user} has been kicked for the following reason:\n\n${reason}`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		if (!member.kickable) throw new SanctionError("For some reason, this member can not be kicked.");

		await member.user.send(kickEmbed.setDescription(`You have been kicked for the following reasion:\n\n${reason}`));

		await member.kick(reason);

		await message.channel.send(kickEmbed);

		await log("modlog", kickEmbed);

		const memberID = member.user.id;

		await db
			.insert({
				discord_id: memberID,
				infraction: reason,
				type: "kick",
				created: Date.now(),
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(memberID);
	}
}
