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
import { DatabaseError } from "../exceptions/DatabaseError";
import { CommandError } from "../exceptions/CommandError";

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
			throw new DatabaseError(`Could not check database; ${error.message}`);
		}

		const commandsPath = path.join(__dirname, "../commands/");
		const commandsFolders = await fs.readdir(commandsPath);
		for (const folder of commandsFolders) {
			const commandPath = path.join(commandsPath, folder);
			try {
				await this.loadCommand(commandPath);
			} catch (error) {
				console.error(`Could not load command in ${folder}; ${error.message}\n${error.stackTrace}`);
			}
		}

		const eventsPath = path.join(__dirname, "../events/");
		const eventsFolders = await fs.readdir(eventsPath);
		for (const folder of eventsFolders) {
			const eventPath = path.join(eventsPath, folder);
			import(eventPath);
		}

		await this.login(config.token);
	}

	private async loadCommand(path: string) {
		const { default: CommandClass } = await import(path);
		const command: Command = new CommandClass();

		if (!command.informations.name) return console.log(`Command in '${path}' does not have any name. Skipping...`);

		if (this.commands.has(command.informations.name)) {
			return console.info(`Command ${command.informations.name} in '${path}' already exists. Skipping...`);
		}

		this.commands.set(command.informations.name, command);

		const category = stringNormalize(command.informations.category) || "Misc";
		command.setCategory(category);
		command.setPath(path);

		console.info(`Command ${command.informations.name} loaded.`);

		if (!command.informations.aliases) return;

		for (const alias of command.informations.aliases) {
			if (this.aliases.has(alias)) {
				console.warn(`Alias ${alias} already exist for command ${this.aliases.get(alias).informations.name}.`);
				continue;
			}
			this.aliases.set(alias, command);
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
			delete require.cache[require.resolve(command.informations.path)];

			return this.loadCommand(command.informations.path);
		} catch (error) {
			throw new CommandError(`Could not reload command ${commandName}; ${error}`);
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
