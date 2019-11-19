import { Message, RichEmbed, Snowflake } from "discord.js";
import { Command } from "../../lib/Command";
import { Client } from "../../lib/Client";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";
import { sendError } from "../../functions/sendError";
import { unsanction } from "../../functions/unsanction";
import { canSanction } from "../../functions/canSanction";

export default class Unban extends Command {
	constructor() {
		super({
			name: "unban",
			description: "Unban a member by its ID",
			usage: "mute <member ID>",
			aliases: ["deban"],
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const member: Snowflake = args[0];

		if (!canSanction(member, message.member, message.channel, "unmute")) return;

		const banned = await message.guild.fetchBans(false);

		if (!banned.get(member)) return sendError("This member is not banned.", message.channel);

		const unbanEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_green)
			.setTitle("Unban")
			.setDescription(`${member} has been unbanned`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL);

		await message.channel.send(unbanEmbed);

		await log("modlog", unbanEmbed);

		await unsanction(member, message.guild, "banned", true);
	}
}
