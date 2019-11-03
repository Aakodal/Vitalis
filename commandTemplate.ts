import { Command } from "../lib/Command";
import { Discord } from "../requires";
import { Client } from "../lib/Client";

export class x extends Command {
	constructor() {
		super({
			name: "",
			description: "",
			usage: "",
			aliases: [],
			category: "",
			permission: "",
		});
	}

	run(message: Discord.Message, args: string[], client: Client) {
		// code here
	}
}
