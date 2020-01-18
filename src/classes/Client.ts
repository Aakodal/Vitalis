import {
	ActivityType, Client as DiscordClient, PresenceStatus,
} from "discord.js";
import { promises as fs } from "fs";
import { Command } from "./Command";
import { getValueFromDB } from "../functions/getValueFromDB";
import { replaceDBVars } from "../functions/replaceDBVars";
import { stringNormalize } from "../functions/stringNormalize";
import { databaseCheck } from "../lib/database";

class Client extends DiscordClient {
	commands: Map<string, Command>;

	aliases: Map<string, Command>;

	constructor() {
		super();

		this.commands = new Map();
		this.aliases = new Map();
	}

	async init() {
		await databaseCheck();

		const commandsFolders: string[] = await fs.readdir("../commands/");
		for (const folder of commandsFolders) {
			const commandsFiles: string[] = await fs.readdir(`../commands/${folder}/`);
			for (const file of commandsFiles) {
				await this.loadCommand(folder, file);
			}
		}

		const eventsFiles = await fs.readdir("../events/");
		for (const file of eventsFiles) {
			import(`../events/${file}`);
		}
	}

	private async loadCommand(folderName: string, commandName: string) {
		try {
			const { default: CommandClass } = await import(`../commands/${folderName}/${commandName}`);
			const command: Command = new CommandClass();

			if (!command.name) return console.log(`Command in ${commandName} does not have any name. Skipping...`);

			if (this.commands.has(command.name)) {
				return console.info(`Command ${command.name} in ${commandName} already exists. Skipping...`);
			}

			this.commands.set(command.name, command);

			const category = stringNormalize(folderName);
			command.setCategory(category);

			console.log(`Command ${command.name} loaded.`);

			command.aliases.forEach((alias: string) => {
				if (this.aliases.has(alias)) {
					return console.info(`Alias ${alias} already exist for command ${this.aliases.get(alias).name}.`);
				}
				this.aliases.set(alias, command);
			});
		} catch (error) {
			return console.error(`Error when trying to load command ${commandName} ; ${error}`);
		}
	}

	reloadCommand(commandName: string) {
		try {
			const command = this.commands.get(commandName);

			if (!command) return console.error(`${commandName} does not exist.`);

			this.aliases.forEach((value, key) => {
				if (value === command) this.aliases.delete(key);
			});

			this.commands.delete(commandName);
			delete require.cache[require.resolve(`../commands/${command.category}/${commandName}`)];

			return this.loadCommand(command.category, commandName);
		} catch (error) {
			throw new Error(`Could not reload command ${commandName} ; ${error}`);
		}
	}

	async updatePresence() {
		const status = await getValueFromDB<PresenceStatus>("server", "status");
		const gameActive = await getValueFromDB<boolean>("server", "gameActive");
		const gameType = await getValueFromDB<ActivityType>("server", "gameType");
		const gameName = await getValueFromDB<string>("server", "gameName");

		const gameFinalName = await replaceDBVars(gameName);

		const presence = {
			status: status || "online",
			game: {
				name: gameFinalName,
				type: gameType,
			},
		};

		if (gameActive) return this.user.setPresence(presence);
		await this.user.setPresence({ status: presence.status });
	}
}

export { Client };
