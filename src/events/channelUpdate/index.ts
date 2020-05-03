import {
	GuildChannel, DMChannel, MessageEmbed, TextChannel,
} from "discord.js";
import { client } from "../../index";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { COLORS } from "../../lib/constants";

client.on("channelUpdate", async (oldChannel: GuildChannel | DMChannel, newChannel: GuildChannel | DMChannel) => {
	const logsActive = await getValueFromDB<boolean>("server", "logsActive");

	if (!logsActive
		|| oldChannel.type === "dm"
		|| newChannel.type === "dm") return;

	const newTextChannel = newChannel as TextChannel;
	const oldTextChannel = oldChannel as TextChannel;

	const channelReference = newChannel.type !== "voice" && newChannel.type !== "category"
		? newChannel
		: newChannel.name;

	const embed = new MessageEmbed()
		.setAuthor("Channel Updated", newChannel.guild.iconURL())
		.setColor(COLORS.gold)
		.addField("**Channel**", channelReference, true)
		.addField("**Type**", newChannel.type, true)
		.setTimestamp(Date.now());

	if (oldChannel.name !== newChannel.name) {
		embed.addField("**Old name**", oldChannel.name);
	}

	if (oldTextChannel.topic !== newTextChannel.topic) {
		if (oldTextChannel.topic) embed.addField("**Old topic**", oldTextChannel.topic);
		if (newTextChannel.topic) embed.addField("**New topic**", newTextChannel.topic);
	}

	if (oldChannel.parent !== newChannel.parent) {
		embed.addField("**Old parent**", oldChannel.parent, false)
			.addField("**New parent**", newChannel.parent, true);
	}

	if (oldTextChannel.nsfw !== newTextChannel.nsfw) {
		embed.addField("**Old NSFW state**", oldTextChannel.nsfw, false)
			.addField("**New NSFW state**", newTextChannel.nsfw, true);
	}

	if (embed.fields.length === 2) return;

	await log("log", embed);
});
