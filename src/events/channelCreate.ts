import { GuildChannel, DMChannel, MessageEmbed } from "discord.js";
import { client } from "../index";
import { getValueFromDB } from "../functions/getValueFromDB";
import { log } from "../functions/log";
import { COLORS } from "../lib/constants";

client.on("channelCreate", async (channel: GuildChannel | DMChannel) => {
	const logsActive = await getValueFromDB<boolean>("server", "logsActive");

	if (!logsActive
		|| channel.type === "dm") return;

	const channelReference = channel.type !== "voice" && channel.type !== "category"
		? channel
		: channel.name;

	const embed = new MessageEmbed()
		.setAuthor("Channel Created", channel.guild.iconURL())
		.setColor(COLORS.light_green)
		.addField("**Channel**", channelReference, true)
		.addField("**Type**", channel.type, true)
		.setTimestamp(Date.now());

	await log("log", embed);
});
