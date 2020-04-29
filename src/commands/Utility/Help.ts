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

		const stockEmbeds = [];
		const updateReactions = async (message, page) => {
			if (stockEmbeds.length <= 0) return;

			if (page === 0) {
				await react("➡⏭", message);
			} else if (page === stockEmbeds.length - 1) {
				await react("⏮⬅", message);
			} else {
				await react("⏮⬅➡⏭", message);
			}

			await react("❌", message);
		};

		const pageNumber = Number(args[0]);

		if (!args[0] || !Number.isNaN(pageNumber)) { // Global help
			const commands = [];

			for (const [, command] of client.commands) {
				const commandData = {
					category: command.informations.category,
					name: command.informations.name,
				};

				if (command.informations.permission === "BOT_OWNER") {
					if (message.author.id === config.botOwner) commands.push(commandData);
					continue;
				}

				if (command.informations.permission) {
					const permission = command.informations.permission as PermissionString;
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
				const categoryA: string = a.category.toUpperCase();
				const categoryB: string = b.category.toUpperCase();
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
			await updateReactions(embedMessage, currentPage);

			const reactionHandler = async (reaction: MessageReaction, user: User) => {
				if (reaction.message.partial) await reaction.message.fetch();
				if (reaction.partial) await reaction.fetch();
				if (user.partial) await user.fetch();

				if (reaction.message.id !== embedMessage.id
					|| user !== message.author
					|| user.bot
					|| "⏮⬅➡⏭❌".indexOf(reaction.emoji.name) < 0) return;

				const reactions = {
					"⏮": () => currentPage = 0,
					"⬅": () => currentPage--,
					"➡": () => currentPage++,
					"⏭": () => currentPage = stockEmbeds.length - 1,
					"❌": () => {
						client.removeListener("messageReactionAdd", reactionHandler);
						embedMessage.delete();
					},
				};
				if (!reactions[reaction.emoji.name]) return;
				reactions[reaction.emoji.name]();

				if (reaction.emoji.name === "❌") return;

				await embedMessage.reactions.removeAll();
				await embedMessage.edit(stockEmbeds[currentPage]);
				await updateReactions(embedMessage, currentPage);
			};

			client.on("messageReactionAdd", reactionHandler);
		} else { // Precise help
			if (!client.commands.has(args[0])) throw new CommandError(`Command ${args[0]} not found.`);

			const command = client.commands.get(args[0].toLowerCase());

			const embed = new MessageEmbed()
				.setAuthor("Help - Command informations")
				.setTitle(`**${prefix}${command.informations.name} - ${command.informations.category} category**`)
				.setColor(COLORS.light_green)
				.setThumbnail(client.user.avatarURL())
				.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL());

			if (command.informations.description) embed.addField("**Description**", command.informations.description);

			if (command.informations.usage) embed.addField("**Usage**", prefix + command.informations.usage);

			if (command.informations.aliases.length > 0) embed.addField("**Aliases**", command.informations.aliases.join(", "));

			if (command.informations.permission) embed.addField("**Permission**", command.informations.permission);

			if (command.informations.permission === "BOT_OWNER") {
				if (message.author.id !== config.botOwner) message.channel.send(embed);
				return;
			}

			if (command.informations.permission) {
				const permission = command.informations.permission as PermissionString;
				if (message.member.hasPermission(permission)) message.channel.send(embed);
				return;
			}

			message.channel.send(embed);
		}
	}
}
