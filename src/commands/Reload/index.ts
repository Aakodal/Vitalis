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
		const commandName = args[0].toLowerCase();
		if (!client.commands.has(commandName)
			&& !client.aliases.has(commandName)) throw new CommandError(`Command \`${args[0]}\` not found.`);

		const command = client.commands.get(commandName) || client.aliases.get(commandName);

		try {
			await client.reloadCommand(command);
		} catch (error) {
			throw new CommandError(error.message);
		}

		const embed = new MessageEmbed()
			.setColor(COLORS.lightGreen)
			.setDescription(`✅ Command ${command.informations.name} reloaded.`);

		message.channel.send(embed);
	}
}
