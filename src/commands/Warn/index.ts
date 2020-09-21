import { Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";
import { canSanction } from "../../functions/canSanction";
import { fetchMember } from "../../functions/fetchMember";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";

export default class Warn extends Command {
	constructor(client: Client) {
		super(
			{
				name: "warn",
				description: "Warn a member with a specified reason",
				category: "Moderation",
				usage: (prefix) => `${prefix}warn <member ID | member mention> <reason>`,
				permission: "KICK_MEMBERS",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		if (!message.guild || !message.member) {
			return;
		}

		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[1]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const memberSnowflake = getUserIdFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake as string);

		if (!member) {
			throw new MemberError();
		}

		const reason = args.slice(1).join(" ");

		if (member.user.bot) {
			throw new SanctionError("You can't warn a bot.");
		}

		if (!(await canSanction(member, message.member, "warn"))) {
			return;
		}

		const memberID = member.user.id;

		await db
			.insert({
				server_id: message.guild?.id,
				discord_id: memberID,
				infraction: reason,
				type: "warn",
				created: Date.now(),
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(memberID, message.guild);

		await db
			.update({
				pseudo: member.user.tag,
				last_warn: Date.now(),
			})
			.into("users")
			.where({ server_id: message.guild?.id, discord_id: memberID });

		const warnEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild?.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTitle("Warning")
			.setDescription(`You have been warned from ${message.guild?.name} for the following reasion:\n\n${reason}`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		try {
			await member.user.send(warnEmbed);
		} catch {}

		warnEmbed.setDescription(`${member.user} has been warned for the following reason:\n\n${reason}`);

		await log("mod_log", warnEmbed, message.guild);

		await message.channel.send(warnEmbed);
	}
}
