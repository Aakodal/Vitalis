import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { CommandError } from "../../exceptions/CommandError";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { COLORS } from "../../lib/constants";

export default class Reload extends Command {
	constructor() {
		super({
			name: "reload",
			description: "Reload a command",
			category: "Bot owner",
			usage: "reload <command>",
			permission: "BOT_OWNER",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);
		if (!client.commands.has(args[0].toLowerCase())) throw new CommandError(`Command \`${args[0]}\` not found.`);

		try {
			await client.reloadCommand(args[0].toLowerCase());
		} catch (error) {
			throw new CommandError(error.message);
		}

		const embed = new MessageEmbed()
			.setColor(COLORS.lightGreen)
			.setDescription(`✅ Command ${args[0].toLowerCase()} reloaded.`);

		message.channel.send(embed);
	}
}
