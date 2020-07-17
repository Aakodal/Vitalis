import { Message, PermissionResolvable } from "discord.js";
import { Client } from "./Client";

type CommandInformations = {
	name: string;
	description?: string;
	category?: string;
	usage?: (prefix: string) => string;
	aliases?: string[];
	permission?: PermissionResolvable | "BOT_OWNER";
	path?: string;
};

export abstract class Command {
	private readonly _informations: CommandInformations;

	protected constructor(informations: CommandInformations) {
		this._informations = informations;
	}

	setCategory(category: string): void {
		this._informations.category = category;
	}

	setPath(path: string): void {
		this._informations.path = path;
	}

	get informations(): CommandInformations {
		return this._informations;
	}

	abstract run(message: Message, args: string[], client: Client): unknown;
}
