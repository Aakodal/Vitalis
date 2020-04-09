import { MessageEmbed } from "discord.js";
import { COLORS } from "../lib/constants";

export function sendEmbed({
	author = "",
	avatar = "",
	title = "",
	color = "",
	text = "",
	footer = "",
	channel,
}) {
	const embedColor = COLORS[color];

	const embed = new MessageEmbed()
		.setAuthor(author, avatar)
		.setTitle(title)
		.setColor(embedColor)
		.setDescription(text)
		.setFooter(footer);

	channel.send(embed);
}
