import { Message, RichEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";
import { sendError } from "../../functions/sendError";
import { unsanction } from "../../functions/unsanction";
import { getMuteRole } from "../../functions/getMuteRole";
import { canSanction } from "../../functions/canSanction";

export default class Unmute extends Command {
	constructor() {
		super({
			name: "unmute",
			description: "Unmute a member",
			usage: "mute <member mention>",
			aliases: ["demute"],
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const id = args[0].slice(3, args[0].length - 1);
		const member = message.mentions.members.get(id);

		if (!member) return sendError("Member not found.", message.channel);

		const muteRole = await getMuteRole(message.guild);

		if (!canSanction(member, message.member, message.channel, "unmute")) return;

		if (!member.roles.get(muteRole.id)) return sendError("This member is not muted.", message.channel);

		const unmuteEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_green)
			.setTitle("Unmute")
			.setDescription(`${member.user} has been unmuted`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL);

		await message.channel.send(unmuteEmbed);

		await log("modlog", unmuteEmbed);

		await unsanction(member.id, message.guild, "muted", true);
	}
}
