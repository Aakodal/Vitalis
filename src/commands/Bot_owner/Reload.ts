import { Message } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { sendEmbed } from "../../functions/sendEmbed";
import { CommandError } from "../../exceptions/CommandError";
import { ArgumentError } from "../../exceptions/ArgumentError";

export default class Reload extends Command {
	constructor() {
		super({
			name: "reload",
			description: "Reload a command",
			usage: "reload <command>",
			permission: "BOT_OWNER",
		});
	}

	run(message: Message, args: string[], client: Client) {
		if (!args[0]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);
		if (!client.commands.has(args[0].toLowerCase())) throw new CommandError(`Command \`${args[0]}\` not found.`);

		try {
			client.reloadCommand(args[0].toLowerCase());
		} catch (error) {
			throw new CommandError(error.message);
		}

		sendEmbed({ text: `✅ Command ${args[0].toLowerCase()} reloaded.`, color: "light_green", channel: message.channel });
	}
}
