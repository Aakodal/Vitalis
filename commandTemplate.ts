import { Message } from "discord.js";
import { Command } from "../../lib/Command";
import { Client } from "../../lib/Client";

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
		super.run(message, args, client);
	}
}
