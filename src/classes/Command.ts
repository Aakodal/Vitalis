import { Message, PermissionResolvable } from "discord.js";
import { Client } from "./Client";

type CommandInformations = {
	name: string,
	description?: string,
	usage?: string,
	aliases?: string[],
	permission?: PermissionResolvable | "BOT_OWNER",
	category?: string,
	commandFile?: string,
};

abstract class Command {
	informations: CommandInformations;

	protected constructor(informations: CommandInformations) {
		this.informations = informations;
	}

	setCategory(category: string) {
		this.informations.category = category;
	}

	setCommandFile(file: string) {
		this.informations.commandFile = file;
	}

	abstract run(message: Message, args: string[], client: Client);
}

export { Command };
