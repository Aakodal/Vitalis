import { RichEmbed } from "discord.js";
import { client } from "../main";
import { COLORS } from "../lib/constants";
import { MessageChannel } from "../typings/types";

export function sendError(text = "", channel: MessageChannel) {
	const embed = new RichEmbed()
		.setAuthor("Error", client.user.avatarURL)
		.setColor(COLORS.dark_red)
		.setDescription(text);

	channel.send(embed);
}
