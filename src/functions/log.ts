import { RichEmbed, TextChannel } from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "./getValueFromDB";

async function log(type: "log" | "modlog", embed: RichEmbed) {
	const channelId: string = await getValueFromDB("server", `${type}sChannel`);
	const isActive: boolean = await getValueFromDB("server", `${type}sActive`);
	if (!channelId
		|| !isActive) return;

	const channel = client.channels.get(channelId) as TextChannel;
	if (!channel) return;

	try {
		await channel.send(embed);
	} catch (error) {
		console.error(`Error when trying to log event ; ${error}`);
	}
}

export { log };
