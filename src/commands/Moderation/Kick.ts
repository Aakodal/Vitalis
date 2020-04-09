import { Message, MessageEmbed, GuildMember } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { sendError } from "../../functions/sendError";
import { canSanction } from "../../functions/canSanction";
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";

export default class Kick extends Command {
	constructor() {
		super({
			name: "kick",
			description: "Kick a member with a specified reason",
			usage: "kick <member ID | member mention> <reason>",
			permission: "KICK_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const memberSnowflake = getUserSnowflakeFromString(args[0]);
		const member = await message.guild.members.fetch(memberSnowflake) as GuildMember;

		if (!member) return sendError("Member not found.", message.channel);

		if (member.partial) await member.fetch();

		const reason = args.slice(1).join(" ");

		if (!await canSanction(member, message.member, message.channel, "kick")) return;

		const kickEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.light_red)
			.setTitle("Kick")
			.setDescription(`${member.user} has been kicked for the following reason:\n\n${reason}`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		if (!member.kickable) return sendError("For some reason, this member can not be kicked.", message.channel);

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
				moderator: message.author.tag,
			})
			.into("infractions");

		await verifUserInDB(memberID);
	}
}
