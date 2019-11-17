import { Message, PermissionString } from "discord.js";
import { Client } from "./Client";


class Command {
	name: string;

	description: string;

	usage: string;

	aliases: string[];

	category: string;

	permission: PermissionString | string;

	constructor(options) {
		this.name = options.name || null;
		this.description = options.description || "No description set.";
		this.usage = options.usage || this.name;
		this.aliases = options.aliases || [];
		this.permission = options.permission || null;

		this.category = "Undefined";
	}

	setCategory(category: string) {
		this.category = category;
	}

	run(message: Message, args: string[], client: Client) {
		throw new Error(`No code set for command ${this.name}`);
	}
}

export { Command };
