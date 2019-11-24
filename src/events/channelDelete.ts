import { GuildChannel, RichEmbed } from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "../functions/getValueFromDB";
import { log } from "../functions/log";
import { COLORS } from "../lib/constants";

client.on("channelDelete", async (channel: GuildChannel) => {
	const logsActive = await getValueFromDB<boolean>("server", "logsActive");

	if (!logsActive
		|| channel.type === "dm"
		|| channel.type === "group") return;

	const embed = new RichEmbed()
		.setAuthor("Channel Deleted", channel.guild.iconURL)
		.setColor(COLORS.light_red)
		.addField("**Channel**", channel.name, true)
		.addField("**Type**", channel.type, true)
		.setTimestamp(Date.now());

	await log("log", embed);
});
