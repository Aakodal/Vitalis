import * as Discord from "discord.js";
import { client, db } from "../requires";
import { COLORS } from "./constants";

function sendEmbed({
	author = "", avatar = "", title = "", color = "", text = "", footer = "", channel = null,
}): Discord.RichEmbed {
	const embedColor = COLORS[color];

	let avatarembed: string;
	if (avatar === "client") {
		avatarembed = client.user.avatarURL;
	} else if (avatar === "server") {
		avatarembed = channel.guild.iconURL;
	} else {
		avatarembed = avatar;
	}

	const embed = new Discord.RichEmbed()
		.setAuthor(author, avatarembed)
		.setTitle(title)
		.setColor(embedColor)
		.setDescription(text)
		.setFooter(footer);

	if (channel) channel.send(embed);
	else return embed;
}

function sendError(text = "", channel = null): Discord.RichEmbed {
	const embed = new Discord.RichEmbed()
		.setAuthor("Error", client.user.avatarURL)
		.setColor(COLORS.dark_red)
		.setDescription(text);

	if (channel) channel.send(embed);
	else return embed;
}

async function getValueFromDB(table: string, column: string) {
	const result = await db.select(column).from(table);
	return result[0][column]
		? result[0][column]
		: null;
}

function fromArrayToLone(array: any) {
	return Array.isArray(array)
		? array[0]
		: array;
}

async function react(emojis: string, message: Discord.Message) {
	for (const emoji of emojis) {
		await message.react(emoji);
	}
}

export {
	sendEmbed, sendError, getValueFromDB, fromArrayToLone, react,
};
