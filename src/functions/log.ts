import { RichEmbed, TextChannel } from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "./getValueFromDB";

async function log(type: "log" | "modlog", embed: RichEmbed) {
	const channelId = await getValueFromDB<string>("server", `${type}sChannel`);
	const isActive = await getValueFromDB<boolean>("server", `${type}sActive`);
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
