import { Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { log } from "../../functions/log";
import { canSanction } from "../../functions/sanction";
import { COLORS } from "../../misc/constants";
import { db, getValueFromDB, userExistsInDB } from "../../misc/database";

export default class Kick extends Command {
	constructor(client: Client) {
		super(
			{
				name: "kick",
				description: "Kick a member with a specified reason",
				category: "Moderation",
				usage: (prefix) => `${prefix}kick <member ID | member mention> <reason>`,
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
		const member = await this.client.fetchMember(message.guild, memberSnowflake as string);

		if (!member) {
			throw new MemberError();
		}

		const reason = args.slice(1).join(" ");

		if (!(await canSanction(member, message.member, "kick", this.client))) {
			return;
		}

		const kickEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild?.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightRed)
			.setTitle("Kick")
			.setDescription(`${member.user} has been kicked for the following reason:\n\n${reason}`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		const userEmbed = new MessageEmbed(kickEmbed).setDescription(
			`You have been kicked from ${message.guild?.name} for the following reasion:\n\n${reason}`,
		);

		if (!member.kickable) {
			throw new SanctionError("For some reason, this member can not be kicked.");
		}

		try {
			await member.user.send(userEmbed);
		} catch {}

		await member.kick(reason);

		const memberID = member.user.id;

		await db
			.insert({
				server_id: message.guild?.id,
				discord_id: memberID,
				infraction: reason,
				type: "kick",
				created: Date.now(),
				moderator: message.author.id,
			})
			.into("infractions");

		await userExistsInDB(memberID, message.guild, this.client);

		await log("mod_log", kickEmbed, message.guild, this.client);

		await message.channel.send(kickEmbed);
	}
}
