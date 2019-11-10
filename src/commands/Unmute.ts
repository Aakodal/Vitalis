import { Message, RichEmbed } from "discord.js";
import { Command } from "../lib/Command";
import { Client } from "../lib/Client";
import {
	sendError, canSanction, getMuteRole, unsanction,
} from "../lib/functions";
import { COLORS } from "../lib/constants";

export default class Unmute extends Command {
	constructor() {
		super({
			name: "unmute",
			description: "Unmute a member",
			usage: "mute <member mention>",
			aliases: ["demute"],
			category: "Moderation",
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const member = message.mentions.members.first();

		const muteRole = await getMuteRole(message.guild);

		if (!canSanction(member, message.member, message.channel, "unmute")) return;

		if (!member.roles.get(muteRole.id)) return sendError("This member is not muted.", message.channel);

		const unmuteEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_green)
			.setTitle("Unmute")
			.setDescription(`${member.user} has been unmuted`)
			.setTimestamp();

		await message.channel.send(unmuteEmbed);

		// TODO: add mod logging here (adding the moderator)

		await unsanction(member.id, message.guild, "muted", true);
	}
}
