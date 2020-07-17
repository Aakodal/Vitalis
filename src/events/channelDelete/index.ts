import { GuildChannel, DMChannel, MessageEmbed } from "discord.js";
import { client } from "../../index";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

client.on("channelDelete", async (channel: GuildChannel | DMChannel) => {
	if (!client.operational || channel.type === "dm") {
		return;
	}

	const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: channel.guild.id });

	if (!logsActive) {
		return;
	}

	const embed = new MessageEmbed()
		.setAuthor("Channel Deleted", channel.guild.iconURL({ dynamic: true }))
		.setColor(COLORS.lightRed)
		.addField("**Channel**", channel.name, true)
		.addField("**Type**", channel.type, true)
		.setTimestamp(Date.now());

	await log("log", embed, channel.guild);
});
