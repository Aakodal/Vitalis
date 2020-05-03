import { GuildChannel, DMChannel, MessageEmbed } from "discord.js";
import { client } from "../../index";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

client.on("channelDelete", async (channel: GuildChannel | DMChannel) => {
	const logsActive = await getValueFromDB<boolean>("server", "logsActive");

	if (!logsActive
		|| channel.type === "dm") return;

	const embed = new MessageEmbed()
		.setAuthor("Channel Deleted", channel.guild.iconURL())
		.setColor(COLORS.lightRed)
		.addField("**Channel**", channel.name, true)
		.addField("**Type**", channel.type, true)
		.setTimestamp(Date.now());

	await log("log", embed);
});
