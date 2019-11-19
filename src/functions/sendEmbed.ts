import { RichEmbed } from "discord.js";
import { COLORS } from "../lib/constants";
import { client } from "../main";

export function sendEmbed({
	author = "", avatar = "", title = "", color = "", text = "", footer = "", channel,
}) {
	const embedColor = COLORS[color];

	let avatarembed: string;
	if (avatar === "client") {
		avatarembed = client.user.avatarURL;
	} else if (avatar === "server") {
		avatarembed = channel.guild.iconURL;
	} else {
		avatarembed = avatar;
	}

	const embed = new RichEmbed()
		.setAuthor(author, avatarembed)
		.setTitle(title)
		.setColor(embedColor)
		.setDescription(text)
		.setFooter(footer);

	channel.send(embed);
}
