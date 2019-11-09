import {
	Message, RichEmbed, Guild, GuildMember, TextChannel, DMChannel, GroupDMChannel,
} from "discord.js";
import { client } from "../main";
import { COLORS } from "./constants";
import { db } from "./database";

type MessageChannel = TextChannel | DMChannel | GroupDMChannel;

function sendEmbed({
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

function sendError(text = "", channel: MessageChannel) {
	const embed = new RichEmbed()
		.setAuthor("Error", client.user.avatarURL)
		.setColor(COLORS.dark_red)
		.setDescription(text);

	channel.send(embed);
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

async function react(emojis: string, message: Message) {
	for (const emoji of emojis) {
		await message.react(emoji);
	}
}

async function replaceDBVars(message: string, options?: {server: Guild, member: GuildMember}): Promise<string> {
	const prefix = await getValueFromDB("server", "prefix");

	return message
		.replace("{PREFIX}", prefix)
		.replace("{SERVER}", options?.server?.name)
		.replace("{MENTION}", `<@${options?.member?.id}>`)
		.replace("{USER}", options?.member?.user.tag);
}

async function pushValueInDB(table: string, column: string, value: any) {
	await db.update({
		[column]: value,
	}).into(table);
}

export {
	sendEmbed, sendError, getValueFromDB, fromArrayToLone, react, replaceDBVars, pushValueInDB,
};
