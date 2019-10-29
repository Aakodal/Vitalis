import { client, Discord, db } from "../requires";
import { COLORS } from "./constants";

const sendEmbed = ({author = "", avatar = "", title = "", color = "", text = "", footer = "", channel = null}) => {
	const embedColor = COLORS[color];

    let avatarembed: string;
	if(avatar === "client"){
		avatarembed = client.user.avatarURL;
	} else if(avatar === "server"){
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
		
	if(channel) channel.send(embed);
	else return embed;
}

const sendError = (text = "", channel = null) => {
    const embed = new Discord.RichEmbed()
		.setAuthor("Error", client.user.avatarURL)
		.setColor(COLORS['dark_red'])
        .setDescription(text);

	if(channel) channel.send(embed);
	else return embed;
}

const getValueFromDB = async (table: string, column: string) => {
	const result = await db.select(column).from(table);
	return result[0][column]
		? result[0][column]
		: null;
}

const fromArrayToLone = (array: any) => {
	return Array.isArray(array)
		? array[0]
		: array;
}

export { sendEmbed, sendError, getValueFromDB, fromArrayToLone };