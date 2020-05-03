import { Message, PermissionResolvable } from "discord.js";
import { Client } from "./Client";

type CommandInformations = {
	name: string,
	description?: string,
	category?: string,
	usage?: string,
	aliases?: string[],
	permission?: PermissionResolvable | "BOT_OWNER",
	path?: string,
};

abstract class Command {
	private readonly _informations: CommandInformations;

	protected constructor(informations: CommandInformations) {
		this._informations = informations;
	}

	setCategory(category: string) {
		this._informations.category = category;
	}

	setPath(file: string) {
		this._informations.path = file;
	}

	get informations() {
		return this._informations;
	}

	abstract run(message: Message, args: string[], client: Client);
}

export { Command };
