import { Message, RichEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { sendError } from "../../functions/sendError";
import { canSanction } from "../../functions/canSanction";

export default class Kick extends Command {
	constructor() {
		super({
			name: "kick",
			description: "Kick a member with a specified reason",
			usage: "kick <member mention> <reason>",
			permission: "KICK_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const member = message.mentions.members.first();
		const reason = args.slice(1).join(" ");

		canSanction(member, message.member, message.channel, "kick");

		const kickEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_red)
			.setTitle("Kick")
			.setDescription(`${member.user} has been kicked for the following reason:\n\n${reason}`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL);

		message.channel.send(kickEmbed);

		await log("modlog", kickEmbed);

		await member.user.send(kickEmbed.setDescription(`You have been kicked for the following reasion:\n\n${reason}`));

		await member.kick(reason);

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
