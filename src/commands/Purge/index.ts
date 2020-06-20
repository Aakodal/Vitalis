import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { UsageError } from "../../exceptions/UsageError";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";

export default class Purge extends Command {
	constructor() {
		super({
			name: "purge",
			description: "Delete a specified amount of messages inside the channel",
			category: "Moderation",
			usage: (prefix) => `${prefix}purge <number>`,
			aliases: ["bulk"],
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage(prefix)}`);
		}

		let amount = Number(args[0]);
		if (!amount || amount <= 0 || amount > 250) {
			throw new UsageError(`Amount must be a number between 1 and 250.`);
		}

		let deleted = 0;
		while (amount !== 0) {
			const iterationAmount = amount > 100
				? 100
				: amount;

			try {
				const deletedMessages = (await message.channel.bulkDelete(iterationAmount, true)).size;
				deleted += deletedMessages;

				if (deletedMessages !== iterationAmount) {
					break; // break to avoid useless iterations as bot cannot delete more messages
				}
			} catch {
				break;
			}
			amount -= iterationAmount;
		}

		const embed = new MessageEmbed()
			.setColor(COLORS.lightGreen)
			.setTitle(`Deleted ${deleted} messages.`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		(await message.channel.send(embed)).delete({ timeout: 5000 });

		const logEmbed = new MessageEmbed(embed).setTitle(`Deleted ${deleted} messages inside ${message.channel}`);

		await log("log", logEmbed, message.guild);
	}
}
