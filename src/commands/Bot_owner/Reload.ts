import { Message } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { sendEmbed } from "../../functions/sendEmbed";
import { sendError } from "../../functions/sendError";

export default class Reload extends Command {
	constructor() {
		super({
			name: "reload",
			description: "Reload a command",
			usage: "reload <command>",
			permission: "BOT_OWNER",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) return sendError(`Missing argument. Usage: \`${this.usage}\``, message.channel);
		if (!client.commands.has(args[0].toLowerCase())) return sendError(`Command \`${args[0]}\` not found.`, message.channel);

		try {
			await client.reloadCommand(args[0].toLowerCase());
			sendEmbed({ text: `✅ Command ${args[0].toLowerCase()} reloaded.`, color: "light_green", channel: message.channel });
		} catch (error) {
			return sendError(error, message.channel);
		}
	}
}
