import { MessageEmbed } from "discord.js";
import { client } from "../main";
import { COLORS } from "../lib/constants";
import { MessageChannel } from "../typings";

export function sendError(text: string, channel: MessageChannel) {
	const embed = new MessageEmbed()
		.setAuthor("Error", client.user.avatarURL())
		.setColor(COLORS.dark_red)
		.setDescription(text);

	channel.send(embed);
}
