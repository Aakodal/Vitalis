import { MessageEmbed, TextBasedChannelFields } from "discord.js";
import { client } from "../index";
import { COLORS } from "../lib/constants";

export function sendError(text: string, channel: TextBasedChannelFields) {
	const embed = new MessageEmbed()
		.setAuthor("Error", client.user.avatarURL())
		.setColor(COLORS.dark_red)
		.setDescription(text);

	channel.send(embed);
}
