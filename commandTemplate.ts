import { Message } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";

export default class x extends Command {
	constructor() {
		super({
			name: "",
			description: "",
			usage: "",
			aliases: [],
			permission: "",
		});
	}

	run(message: Message, args: string[], client: Client) {
		throw new Error("This command does not have code.");
	}
}
