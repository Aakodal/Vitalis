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

export default class Warn extends Command {
	constructor() {
		super({
			name: "warn",
			description: "Warn a member with a specified reason",
			usage: "warn <member ID | member mention> <reason>",
			permission: "KICK_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);

		const memberSnowflake = getUserIdFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

		if (!member) throw new MemberError();

		const reason = args.slice(1).join(" ");

		if (member.user.bot) throw new SanctionError("You can't warn a bot.");

		if (!await canSanction(member, message.member, "warn")) return;

		const warnEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.lightGreen)
			.setTitle("Warning")
			.setDescription(`${member.user} has been warned for the following reason:\n\n${reason}`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		await message.channel.send(warnEmbed);

		await log("modlog", warnEmbed);

		await member.user.send(warnEmbed.setDescription(`You have been warned for the following reasion:\n\n${reason}`));

		const memberID = member.user.id;

		await db
			.insert({
				discord_id: memberID,
				infraction: reason,
				type: "warn",
				created: Date.now(),
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(memberID);

		await db
			.update({
				pseudo: member.user.tag,
				last_warn: Date.now(),
			})
			.into("users")
			.where({ discord_id: memberID });
	}
}
