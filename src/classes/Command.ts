import { Message } from "discord.js";
import { CommandInformations } from "../typings";
import { Client } from "./Client";


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
