import { Command } from "../lib/Command";
import { Discord, config } from "../requires";
import { Client } from "../lib/Client";
import {
	getValueFromDB, sendError, fromArrayToLone, react,
} from "../lib/functions";
import { COLORS } from "../lib/constants";

export default class Help extends Command {
	constructor() {
		super({
			name: "help",
			description: "Get commands help",
			usage: "help [command|page number]",
			category: "Utility",
		});
	}

	async run(message: Discord.Message, args: any[], client: Client) {
		const prefix = await getValueFromDB("server", "prefix");

		let embed = new Discord.RichEmbed()
			.setColor(COLORS.light_green)
			.setThumbnail(client.user.avatarURL)
			.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL);

		const stockEmbeds = [];
		const updateReactions = async (message, page) => {
			if (stockEmbeds.length > 1) {
				if (page === 0) {
					await react("➡⏭", message);
				} else if (page === stockEmbeds.length - 1) {
					await react("⏮⬅", message);
				} else {
					await react("⏮⬅➡⏭", message);
				}
			}
		};

		if (!args[0] || !Number.isNaN(args[0])) { // Global help
			const commands = [];

			client.commands.forEach((command: any) => {
				const commandData = {
					category: command.category,
					name: command.name,
				};
				if (command.permission === "BOT_OWNER") {
					if (message.author.id === config.botOwner) commands.push(commandData);
					return;
				}
				if (command.permission) {
					if (message.member.hasPermission(command.permission)) commands.push(commandData);
					return;
				}
				commands.push(commandData);
			});

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

			const getCommand: any = (index: number) => client.commands.get(commands[index].name);

			embed.addField(`**${prefix}${commands[0].name}**`, getCommand(0).description);

			for (let i = 1; i < commands.length; i++) {
				if (commands[i].category.toUpperCase() !== commands[i - 1].category.toUpperCase()) {
					stockEmbeds.push(embed);
					embed = new Discord.RichEmbed()
						.setColor(COLORS.light_green)
						.setThumbnail(client.user.avatarURL)
						.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL);

					embed.setTitle(`${commands[i].category} category`);
				}

				embed.addField(`**${prefix}${commands[i].name}**`, getCommand(i).description);
			}
			stockEmbeds.push(embed);

			stockEmbeds.forEach((page: Discord.RichEmbed, index) => {
				page.setAuthor(`Commands available - Page ${index + 1} on ${stockEmbeds.length}`);
			});

			let currentPage = args[0] && !Number.isNaN(args[0])
				? args[0] > stockEmbeds.length - 1
					? stockEmbeds.length - 1
					: args[0]
				: 0;

			const botMessage = await message.channel.send(stockEmbeds[currentPage]);
			const embedMessage = fromArrayToLone(botMessage);
			await updateReactions(embedMessage, currentPage);

			client.on("messageReactionAdd", async (reaction, user) => {
				if (reaction.message.id !== embedMessage.id
                    || user !== message.author
                    || user.bot
                    || "⏮⬅➡⏭".indexOf(reaction.emoji.name) < 0) return;

				const reactions = {
					"⏮": () => currentPage = 0,
					"⬅": () => currentPage--,
					"➡": () => currentPage++,
					"⏭": () => currentPage = stockEmbeds.length - 1,
				};
				if (!reactions[reaction.emoji.name]) return;
				reactions[reaction.emoji.name]();

				await embedMessage.clearReactions();
				embedMessage.edit(stockEmbeds[currentPage]);
				await updateReactions(embedMessage, currentPage);
			});
		} else { // Precise help
			if (!client.commands.has(args[0])) return sendError(`Command ${args[0]} not found.`, message.channel);

			const command: any = client.commands.get(args[0].toLowerCase());

			const embed = new Discord.RichEmbed()
				.setAuthor("Help - Command informations")
				.setTitle(`**${prefix}${command.name} - ${command.category} category**`)
				.setColor(COLORS.light_green)
				.setThumbnail(client.user.avatarURL)
				.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL);

			if (command.description) embed.addField("**Description**", command.description);

			if (command.usage) embed.addField("**Usage**", prefix + command.usage);

			if (command.aliases.length > 0) embed.addField("**Aliases**", command.aliases.join(", "));

			if (command.permission) embed.addField("**Permission**", command.permission);

			if (command.permission === "BOT_OWNER") {
				if (message.author.id === config.botOwner) message.channel.send(embed);
				return;
			}

			if (command.permission) {
				if (message.member.hasPermission(command.permission)) message.channel.send(embed);
				return;
			}

			message.channel.send(embed);
		}
	}
}
