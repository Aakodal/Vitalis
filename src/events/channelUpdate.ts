import {
	GuildChannel, DMChannel, MessageEmbed, TextChannel
} from "discord.js";
import { client } from "../main";
import { getValueFromDB } from "../functions/getValueFromDB";
import { log } from "../functions/log";
import { COLORS } from "../lib/constants";

client.on("channelUpdate", async (oldChannel: GuildChannel | DMChannel, newChannel: GuildChannel | DMChannel) => {
	const logsActive = await getValueFromDB<boolean>("server", "logsActive");

	if (!logsActive
		|| newChannel.type === "dm") return;

	const newGuildChannel = newChannel as GuildChannel;
	const oldGuildChannel = oldChannel as GuildChannel;

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

	if (oldGuildChannel.name !== newGuildChannel.name) {
		embed.addField("**Old name**", oldGuildChannel.name);
	}

	if (oldTextChannel.topic !== newTextChannel.topic) {
		if (oldTextChannel.topic) embed.addField("**Old topic**", oldTextChannel.topic);
		if (newTextChannel.topic) embed.addField("**New topic**", newTextChannel.topic);
	}

	if (oldGuildChannel.parent !== newGuildChannel.parent) {
		embed.addField("**Old parent**", oldGuildChannel.parent, false)
			.addField("**New parent**", newGuildChannel.parent, true);
	}

	if (oldTextChannel.nsfw !== newTextChannel.nsfw) {
		embed.addField("**Old NSFW state**", oldTextChannel.nsfw, false)
			.addField("**New NSFW state**", newTextChannel.nsfw, true);
	}

	if (embed.fields.length === 2) return;

	await log("log", embed);
});
