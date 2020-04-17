import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";
import { sendError } from "../../functions/sendError";
import { unsanction } from "../../functions/unsanction";
import { canSanction } from "../../functions/canSanction";
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";
import { fetchUser } from "../../functions/fetchUser";

export default class Unban extends Command {
	constructor() {
		super({
			name: "unban",
			description: "Unban a member by its ID",
			usage: "unban <user ID | user mention>",
			aliases: ["deban"],
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const userSnowflake = getUserSnowflakeFromString(args[0]);
		const user = await fetchUser(userSnowflake);

		if (!user) return sendError("User not found.", message.channel);

		if (user.partial) await user.fetch();

		if (!await canSanction(user, message.member, message.channel, "unban")) return;

		const banned = await message.guild.fetchBans();

		if (!banned.get(user.id)) return sendError("This user is not banned.", message.channel);

		const unbanEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.light_green)
			.setTitle("Unban")
			.setDescription(`${user} has been unbanned`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		try {
			await unsanction(user.id, message.guild, "banned", true);
		} catch (error) {
			return sendError(`For some reason, this user couldn't have been unbanned;\n\n${error}`, message.channel);
		}

		await message.channel.send(unbanEmbed);

		await log("modlog", unbanEmbed);
	}
}
