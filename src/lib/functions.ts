import { client, Discord, db } from "../requires";


const COLORS: Object = {
    red: "0xFF0000",
    green: "0x00FF00",
    blue: "0x0000FF",
    orange: "0xFF6600",
    yellow: "0xFFFF00",
    gold: "0xFFCC00",
    light_red: "0xF33030",
	dark_red: "0xA61111",
	light_green: "0xB5E655",
	dark_green: "0x00B200",
	cyan: "0x00FFFF",
	dark_blue: "0x00008B",
	brown: "0x8B4513",
	purple: "0x9d2dff",
	pink: "0xff6df2",
	magenta: "0xE500E5"
}

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

export { COLORS, sendEmbed, sendError, getValueFromDB };