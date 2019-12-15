import { RichEmbed } from "discord.js";
import { COLORS } from "../lib/constants";
import { client } from "../main";

export function sendEmbed({
	author = "", avatar = "", title = "", color = "", text = "", footer = "", channel,
}) {
	const embedColor = COLORS[color];

	const embed = new RichEmbed()
		.setAuthor(author, avatar)
		.setTitle(title)
		.setColor(embedColor)
		.setDescription(text)
		.setFooter(footer);

	channel.send(embed);
}
