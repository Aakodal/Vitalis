import {
	Message, PermissionString, MessageEmbed, MessageReaction, User,
} from "discord.js";
import { Command } from "../../classes/Command";
import * as config from "../../config.json";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { react } from "../../functions/react";
import { CommandError } from "../../exceptions/CommandError";
import { stringNormalize } from "../../functions/stringNormalize";
import { PermissionError } from "../../exceptions/PermissionError";

export default class Help extends Command {
	constructor() {
		super({
			name: "help",
			description: "Get commands help",
			usage: "help [command|page number]",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		const prefix = await getValueFromDB<string>("server", "prefix");

		let embed = new MessageEmbed()
			.setColor(COLORS.light_green)
			.setThumbnail(client.user.avatarURL())
			.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL());

		const stockEmbeds: MessageEmbed[] = [];

		const pageNumber = Number(args[0]);

		if (!args[0] || Number.isInteger(pageNumber)) { // Global help
			const commands: {category: string, name: string}[] = [];

			for (const [, command] of client.commands) {
				const { category, name, permission } = command.informations;
				const commandData = { category, name };

				if (permission === "BOT_OWNER") {
					if (message.author.id === config.botOwner) commands.push(commandData);
					continue;
				}

				if (permission) {
					if (message.member.hasPermission(permission)) commands.push(commandData);
					continue;
				}

				commands.push(commandData);
			}

			if (!commands[0]) {
				embed.setTitle("No command found.");
				return message.channel.send(embed);
			}

			commands.sort((a, b) => {
				const categoryA = a.category.toUpperCase();
				const categoryB = b.category.toUpperCase();
				if (categoryA < categoryB) return -1;
				if (categoryA > categoryB) return 1;
				return 0;
			});

			embed.setTitle(`${commands[0].category} category`);

			const getCommandByIndex = (index: number) => client.commands.get(commands[index].name);

			embed.addField(`**${prefix}${commands[0].name}**`, getCommandByIndex(0).informations.description);

			for (let i = 1; i < commands.length; i++) {
				if (commands[i].category.toUpperCase() !== commands[i - 1].category.toUpperCase()) {
					stockEmbeds.push(embed);
					embed = new MessageEmbed()
						.setColor(COLORS.light_green)
						.setThumbnail(client.user.avatarURL())
						.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL());

					embed.setTitle(`${commands[i].category} category`);
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

			const embedMessage = await message.channel.send(stockEmbeds[currentPage]) as Message;
			await this.updateReactions(embedMessage, stockEmbeds, currentPage);

			const filter = (reaction: MessageReaction, user: User) => reaction.message.id === embedMessage.id
				&& user === message.author
				&& !user.bot
				&& ["⏮️", "⬅", "➡", "⏭", "❌"].includes(reaction.emoji.name);

			while (embedMessage) {
				const collected = await embedMessage.awaitReactions(filter, { max: 1 });
				const reaction = collected.first();

				if (reaction.partial) await reaction.fetch();
				if (reaction.message.partial) await reaction.message.fetch();

				const reactions = {
					"⏮": () => currentPage = 0,
					"⬅": () => currentPage--,
					"➡": () => currentPage++,
					"⏭": () => currentPage = stockEmbeds.length - 1,
					"❌": () => embedMessage.delete(),
				};

				if (!reactions[reaction.emoji.name]) return;
				reactions[reaction.emoji.name]();

				if (reaction.emoji.name === "❌") return;

				await embedMessage.reactions.removeAll();
				await embedMessage.edit(stockEmbeds[currentPage]);
				await this.updateReactions(embedMessage, stockEmbeds, currentPage);
			}
		} else { // Specific command help
			if (!client.commands.has(args[0])) throw new CommandError(`Command ${args[0]} not found.`);

			const command = client.commands.get(args[0].toLowerCase());
			const {
				name, description, usage, aliases, permission, category,
			} = command.informations;

			if (permission === "BOT_OWNER"
				&& message.author.id !== config.botOwner) {
				throw new PermissionError("You do not have permission to see this command.");
			}

			if (permission
				&& !message.member.hasPermission(permission as PermissionString)) {
				throw new PermissionError("You do not have permission to see this command.");
			}

			const embed = new MessageEmbed()
				.setAuthor("Help - Command informations")
				.setTitle(`**${prefix}${name} - ${category} category**`)
				.setColor(COLORS.light_green)
				.setThumbnail(client.user.avatarURL())
				.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL());

			if (description) embed.addField("**Description**", description);

			embed.addField("**Usage**", prefix + (usage || name));

			if (aliases?.length > 0) embed.addField("**Aliases**", aliases.join(", "));

			if (permission) {
				const permissionName = stringNormalize(permission as string);
				embed.addField("**Permission**", permissionName);
			}

			message.channel.send(embed);
		}
	}

	private async updateReactions(message: Message, embeds: MessageEmbed[], page: number) {
		if (embeds.length <= 0) return;

		if (page === 0) {
			await react("➡⏭", message);
		} else if (page === embeds.length - 1) {
			await react("⏮⬅", message);
		} else {
			await react("⏮⬅➡⏭", message);
		}

		await react("❌", message);
	}
}
