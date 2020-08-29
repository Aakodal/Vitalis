import {
	Message, MessageEmbed, MessageReaction, User,
} from "discord.js";
import * as config from "../../../config.json";
import { Command } from "../../../classes/Command";
import { COLORS } from "../../../lib/constants";
import { updateReactions } from "../functions/updateReactions";
import { collectReaction } from "../../../functions/collectReaction";
import { Client } from "../../../classes/Client";

export async function globalHelp(
	message: Message,
	pageNumber: number,
	client: Client,
	prefix: string,
): Promise<void> {
	const commands: { category: string; name: string }[] = [];
	const stockEmbeds: MessageEmbed[] = [];

	let embed = new MessageEmbed()
		.setColor(COLORS.lightGreen)
		.setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) as string)
		.setFooter(`Asked by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

	for (const [, command] of client.commands) {
		const { category, name, permission } = command.informations;
		const commandData = { category, name };

		if (permission === "BOT_OWNER") {
			if (message.author.id === config.botOwner) {
				commands.push(commandData);
			}
			continue;
		}

		if (permission) {
			if (message.member?.hasPermission(permission)) {
				commands.push(commandData);
			}
			continue;
		}

		commands.push(commandData);
	}

	if (!commands[0]) {
		embed.setTitle("No command found.");
		await message.channel.send(embed);
		return;
	}

	commands.sort((a, b) => {
		const categoryA = a.category;
		const categoryB = b.category;
		if (categoryA < categoryB) {
			return -1;
		}
		if (categoryA > categoryB) {
			return 1;
		}
		return 0;
	});

	embed.setTitle(commands[0].category);

	const getCommandByIndex = (index: number): Command => client.commands.get(commands[index].name) as Command;

	embed.addField(`**${prefix}${commands[0].name}**`, getCommandByIndex(0).informations.description);

	for (let i = 1; i < commands.length; i++) {
		if (commands[i].category !== commands[i - 1].category) {
			stockEmbeds.push(embed);
			embed = new MessageEmbed()
				.setColor(COLORS.lightGreen)
				.setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) as string)
				.setFooter(`Asked by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

			embed.setTitle(commands[i].category);
		}

		embed.addField(`**${prefix}${commands[i].name}**`, getCommandByIndex(i).informations.description);
	}
	stockEmbeds.push(embed);

	for (const [index, page] of stockEmbeds.entries()) {
		page.setAuthor(`Commands available - Page ${index + 1} on ${stockEmbeds.length}`);
	}

	const page = pageNumber > 0
		? pageNumber - 1
		: 0;

	let currentPage = page > stockEmbeds.length - 1
		? stockEmbeds.length - 1
		: page;

	const embedMessage = await message.channel.send(stockEmbeds[currentPage]);
	await updateReactions(embedMessage, stockEmbeds, currentPage);

	const filter = (reaction: MessageReaction, user: User): boolean => reaction.message.id === embedMessage.id
		&& user === message.author
		&& !user.bot
		&& ["⏮️", "⬅", "➡", "⏭", "❌"].includes(reaction.emoji.name);

	const reactions: Record<string, () => void> = {
		"⏮": (): number => (currentPage = 0),
		"⬅": (): number => currentPage--,
		"➡": (): number => currentPage++,
		"⏭": (): number => (currentPage = stockEmbeds.length - 1),
		"❌": (): void => void embedMessage.delete(),
	};

	while (embedMessage && !embedMessage.deleted) {
		const reaction = await collectReaction(embedMessage, filter);
		if (!reaction) {
			return;
		}

		if (!reactions[reaction.emoji.name]) {
			continue;
		}
		reactions[reaction.emoji.name]();

		if (reaction.emoji.name === "❌") {
			break;
		}

		await embedMessage.reactions.removeAll();
		await embedMessage.edit(stockEmbeds[currentPage]);
		await updateReactions(embedMessage, stockEmbeds, currentPage);
	}
}
