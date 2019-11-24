import { GuildChannel, RichEmbed } from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "../functions/getValueFromDB";
import { log } from "../functions/log";
import { COLORS } from "../lib/constants";

client.on("channelCreate", async (channel: GuildChannel) => {
	const logsActive = await getValueFromDB<boolean>("server", "logsActive");

	if (!logsActive
		|| channel.type === "dm"
		|| channel.type === "group") return;

	const channelReference = channel.type !== "voice" && channel.type !== "category"
		? channel
		: channel.name;

	const embed = new RichEmbed()
		.setAuthor("Channel Created", channel.guild.iconURL)
		.setColor(COLORS.light_green)
		.addField("**Channel**", channelReference, true)
		.addField("**Type**", channel.type, true)
		.setTimestamp(Date.now());

	await log("log", embed);
});
