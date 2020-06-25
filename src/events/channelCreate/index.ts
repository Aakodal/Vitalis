import { GuildChannel, DMChannel, MessageEmbed } from "discord.js";
import { client } from "../../index";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

client.on("channelCreate", async (channel: GuildChannel | DMChannel) => {
	if (!client.operational || channel.type === "dm") {
		return;
	}

	const logsActive = await getValueFromDB<boolean>("servers", "logs_active", { server_id: channel.guild.id });

	if (!logsActive) {
		return;
	}

	const channelReference = channel.type !== "voice" && channel.type !== "category"
		? channel
		: channel.name;

	const embed = new MessageEmbed()
		.setAuthor("Channel Created", channel.guild..iconURL({ dynamic: true }))
		.setColor(COLORS.lightGreen)
		.addField("**Channel**", channelReference, true)
		.addField("**Type**", channel.type, true)
		.setTimestamp(Date.now());

	await log("log", embed, channel.guild);
});
