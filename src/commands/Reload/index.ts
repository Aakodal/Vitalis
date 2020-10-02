import { Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { CommandError } from "../../exceptions/CommandError";
import { COLORS } from "../../misc/constants";
import { getValueFromDB } from "../../misc/database";

export default class Reload extends Command {
	constructor(client: Client) {
		super(
			{
				name: "reload",
				description: "Reload a command",
				category: "Bot owner",
				usage: (prefix) => `${prefix}reload <command>`,
				permission: "BOT_OWNER",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const commandName = args[0].toLowerCase();

		const command = this.client.commands.get(commandName) || this.client.aliases.get(commandName);

		if (!command) {
			throw new CommandError(`Command \`${args[0]}\` not found.`);
		}

		try {
			await this.client.reloadCommand(command);
		} catch (error) {
			throw new CommandError(error.message);
		}

		const embed = new MessageEmbed()
			.setColor(COLORS.lightGreen)
			.setDescription(`✅ Command ${command.informations.name} reloaded.`);

		await message.channel.send(embed);
	}
}
