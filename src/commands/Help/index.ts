import { Message } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { globalHelp } from "./pages/globalHelp";
import { commandHelp } from "./pages/commandHelp";

export default class Help extends Command {
	constructor(client: Client) {
		super({
			name: "help",
			description: "Get commands help",
			category: "Utility",
			usage: (prefix) => `${prefix}help [command|page number]`,
		}, client);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		const pageNumber = Number(args[0]);

		return !args[0] || Number.isInteger(pageNumber)
			? globalHelp(message, pageNumber, this.client, prefix)
			: commandHelp(message, args, this.client, prefix);
	}
}
