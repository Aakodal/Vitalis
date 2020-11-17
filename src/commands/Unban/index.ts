import { Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { SanctionError } from "../../exceptions/SanctionError";
import { UserError } from "../../exceptions/UserError";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { log } from "../../functions/log";
import { canSanction } from "../../functions/sanction";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class Unban extends Command {
	constructor(client: Client) {
		super(
			{
				name: "unban",
				description: "Unban a member by its ID",
				category: "Moderation",
				usage: (prefix) => `${prefix}unban <user ID | user mention>`,
				aliases: ["deban"],
				permission: "BAN_MEMBERS",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		if (!message.guild || !message.member) {
			return;
		}

		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await this.client.fetchUser(userSnowflake as string);

		if (!user) {
			throw new UserError();
		}

		if (!(await canSanction(user, message.member, "unban", this.client))) {
			return;
		}

		const banned = await message.guild?.fetchBans();

		if (!banned.get(user.id)) {
			throw new SanctionError("This user is not banned.");
		}

		const unbanEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild?.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTitle("Unban")
			.setDescription(`${user} has been unbanned.`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		try {
			await this.client.unsanction(user.id, message.guild, "banned", true);
		} catch (error) {
			throw new SanctionError(`For some reason, this user couldn't have been unbanned; ${error.message}`);
		}

		await log("mod_log", unbanEmbed, message.guild, this.client);

		await message.channel.send(unbanEmbed);
	}
}
