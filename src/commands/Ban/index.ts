import { Guild, Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { SanctionError } from "../../exceptions/SanctionError";
import { UsageError } from "../../exceptions/UsageError";
import { UserError } from "../../exceptions/UserError";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { log } from "../../functions/log";
import { longTimeout } from "../../functions/longTimeout";
import { canSanction, getSanctionValues } from "../../functions/sanction";
import { COLORS } from "../../misc/constants";
import { db, getValueFromDB, userExistsInDB } from "../../misc/database";

export default class Ban extends Command {
	constructor(client: Client) {
		super(
			{
				name: "ban",
				description: "Ban a member with a specified reason",
				category: "Moderation",
				usage: (prefix) => `${prefix}ban <user ID | user mention> [duration] <reason>`,
				permission: "BAN_MEMBERS",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[1]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await this.client.fetchUser(userSnowflake as string);

		if (!user) {
			throw new UserError();
		}

		if (!message.member || !message.guild) {
			return;
		}

		if (!(await canSanction(user, message.member, "ban", this.client))) {
			return;
		}

		const banned = await message.guild.fetchBans();

		if (banned.get(user.id)) {
			throw new SanctionError("This user is already banned.");
		}

		const [durationString, duration, reason, embedDescription, dmDescription] = getSanctionValues(
			args,
			"banned",
			user,
			message.guild,
		);
		const durationNumber = Number(duration);
		const reasonText = String(reason);

		if (durationNumber && !args[2]) {
			throw new UsageError(`Wrong command usage. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const banEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild?.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTitle("Ban")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		const userEmbed = new MessageEmbed(banEmbed).setDescription(dmDescription);

		const member = await this.client.fetchMember(message.guild, user);

		if (member && !member.bannable) {
			throw new SanctionError("For some reason, this member can not be banned.");
		}

		if (member) {
			try {
				await user.send(userEmbed);
			} catch {}
		}

		try {
			await message.guild?.members.ban(user, {
				days: 7,
				reason: reasonText,
			});
		} catch (error) {
			throw new SanctionError(`This user couldn't have been banned; ${error.message}`);
		}

		const userID = user.id;

		const created = Date.now();

		const expiration = duration ? created + durationNumber : null;

		await db
			.insert({
				server_id: message.guild?.id,
				discord_id: userID,
				infraction: reasonText,
				type: "ban",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.id,
			})
			.into("infractions");

		await userExistsInDB(userID, message.guild, this.client);

		await db
			.update({
				pseudo: user.tag,
				actual_sanction: "banned",
				created,
				expiration,
			})
			.into("users")
			.where({ server_id: message.guild?.id, discord_id: userID });

		await log("mod_log", banEmbed, message.guild, this.client);

		await message.channel.send(banEmbed);

		if (!expiration) {
			return;
		}

		longTimeout(async () => {
			await this.client.unsanction(userID, message.guild as Guild, "banned", false);
		}, expiration - created);
	}
}
