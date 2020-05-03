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

export default class Unban extends Command {
	constructor() {
		super({
			name: "unban",
			description: "Unban a member by its ID",
			category: "Moderation",
			usage: "unban <user ID | user mention>",
			aliases: ["deban"],
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await fetchUser(userSnowflake);

		if (!user) throw new UserError();

		if (!await canSanction(user, message.member, "unban")) return;

		const banned = await message.guild.fetchBans();

		if (!banned.get(user.id)) throw new SanctionError("This user is not banned.");

		const unbanEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.lightGreen)
			.setTitle("Unban")
			.setDescription(`${user} has been unbanned.`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		try {
			await unsanction(user.id, message.guild, "banned", true);
		} catch (error) {
			throw new SanctionError(`For some reason, this user couldn't have been unbanned; ${error.message}`);
		}

		await message.channel.send(unbanEmbed);

		await log("modlog", unbanEmbed);
	}
}
