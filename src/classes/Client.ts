import {
	ActivityType, Client as DiscordClient, ClientOptions, PresenceData, PresenceStatusData,
} from "discord.js";
import { promises as fs } from "fs";
import * as path from "path";
import { Command } from "./Command";
import { getValueFromDB } from "../functions/getValueFromDB";
import { replaceDBVars } from "../functions/replaceDBVars";
import { stringNormalize } from "../functions/stringNormalize";
import { databaseCheck } from "../lib/database";
import * as config from "../config.json";

class Client extends DiscordClient {
	commands: Map<string, Command>;

	aliases: Map<string, Command>;

	constructor(options?: ClientOptions) {
		super(options);

		this.commands = new Map();
		this.aliases = new Map();
	}

	async init() {
		if (!config.botOwner
			|| !config.botOwner.match(/\d+/)) console.warn(`Owner's ID is undefined or invalid.`);

		try {
			await databaseCheck();
		} catch (error) {
			console.error(`Error while checking databse: ${error}`);
		}

		const commandsPath = path.join(__dirname, "../commands/");
		const commandsFolders = await fs.readdir(commandsPath);
		for (const folder of commandsFolders) {
			const folderPath = path.join(commandsPath, folder);
			const commandsFiles = await fs.readdir(folderPath);
			for (const file of commandsFiles) {
				await this.loadCommand(folder, file);
			}
		}

		const eventsPath = path.join(__dirname, "../events/");
		const eventsFiles = await fs.readdir(eventsPath);
		for (const file of eventsFiles) {
			const eventPath = path.join(eventsPath, file);
			import(eventPath);
		}

		await this.login(config.token);
	}

	private async loadCommand(folderName: string, commandFile: string) {
		try {
			const commandPath = path.join(__dirname, `../commands/${folderName}/${commandFile}`);
			const { default: CommandClass } = await import(commandPath);
			const command: Command = new CommandClass();

			if (!command.informations.name) return console.log(`Command in ${commandFile} does not have any name. Skipping...`);

			if (this.commands.has(command.informations.name)) {
				return console.info(`Command ${command.informations.name} in ${commandFile} already exists. Skipping...`);
			}

			this.commands.set(command.informations.name, command);

			const category = stringNormalize(folderName);
			command.setCategory(category);
			command.setCommandFile(commandFile);

			console.info(`Command ${command.informations.name} loaded.`);

			if (!command.informations.aliases) return;

			for (const alias of command.informations.aliases) {
				if (this.aliases.has(alias)) {
					console.warn(`Alias ${alias} already exist for command ${this.aliases.get(alias).informations.name}.`);
					continue;
				}
				this.aliases.set(alias, command);
			}
		} catch (error) {
			return console.error(`Error when trying to load command ${commandFile} ; ${error}`);
		}
	}

	reloadCommand(commandName: string) {
		try {
			const command = this.commands.get(commandName);

			if (!command) return console.error(`${commandName} does not exist.`);

			for (const [key, value] of this.aliases) {
				if (value === command) this.aliases.delete(key);
			}

			this.commands.delete(commandName);
			const commandPath = path.join(__dirname, `../commands/${command.informations.category}/${command.informations.commandFile}`);
			delete require.cache[require.resolve(commandPath)];

			return this.loadCommand(command.informations.category, commandName);
		} catch (error) {
			throw new Error(`Could not reload command ${commandName} ; ${error}`);
		}
	}

	async updatePresence() {
		const status = await getValueFromDB<PresenceStatusData>("server", "status");
		const gameActive = await getValueFromDB<boolean>("server", "gameActive");
		const gameType = await getValueFromDB<ActivityType>("server", "gameType");
		const gameName = await getValueFromDB<string>("server", "gameName");

		const gameFinalName = await replaceDBVars(gameName);

		const presence: PresenceData = {
			activity: {
				name: gameFinalName,
				type: gameType,
			},
		};

		if (gameActive) await this.user.setPresence(presence);
		await this.user.setStatus(status || "online");
	}
}

export { Client };
