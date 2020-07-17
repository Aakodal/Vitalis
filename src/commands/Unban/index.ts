import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";
import { unsanction } from "../../functions/unsanction";
import { canSanction } from "../../functions/canSanction";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchUser } from "../../functions/fetchUser";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { UserError } from "../../exceptions/UserError";
import { SanctionError } from "../../exceptions/SanctionError";
import { getValueFromDB } from "../../functions/getValueFromDB";

export default class Unban extends Command {
	constructor() {
		super({
			name: "unban",
			description: "Unban a member by its ID",
			category: "Moderation",
			usage: (prefix) => `${prefix}unban <user ID | user mention>`,
			aliases: ["deban"],
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage(prefix)}`);
		}

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await fetchUser(userSnowflake);

		if (!user) {
			throw new UserError();
		}

		if (!(await canSanction(user, message.member, "unban"))) {
			return;
		}

		const banned = await message.guild.fetchBans();

		if (!banned.get(user.id)) {
			throw new SanctionError("This user is not banned.");
		}

		const unbanEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL({ dynamic: true }))
			.setColor(COLORS.lightGreen)
			.setTitle("Unban")
			.setDescription(`${user} has been unbanned.`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		try {
			await unsanction(user.id, message.guild, "banned", true);
		} catch (error) {
			throw new SanctionError(`For some reason, this user couldn't have been unbanned; ${error.message}`);
		}

		await message.channel.send(unbanEmbed);

		await log("mod_log", unbanEmbed, message.guild);
	}
}
