import { Client as DiscordClient, Collection } from "discord.js";
import { getValueFromDB, replaceDBVars } from "./functions";
import { Command } from "./Command";

class Client extends DiscordClient {
	commands: Collection<string, Command>;

	aliases: Collection<string, Command>;

	constructor() {
		super();

		this.commands = new Collection();
		this.aliases = new Collection();
	}

	async loadCommand(commandName: string) {
		try {
			const { default: CommandClass } = await import(`../commands/${commandName}`);
			const command = new CommandClass();
			if (!command.name) return console.log(`Command in ${commandName} does not have any name. Skipping...`);
			if (this.commands.has(command.name)) {
				return console.info(`Command ${command.name} in ${commandName} already exists. Skipping...`);
			}
			this.commands.set(command.name, command);
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
			delete require.cache[require.resolve(`../commands/${commandName}`)];

			this.loadCommand(commandName);
			return `Command ${commandName} reloaded.`;
		} catch (error) {
			throw new Error(`Could not reload command ${commandName} ; ${error}`);
		}
	}

	async updatePresence() {
		const status = await getValueFromDB("server", "status");
		const gameActive = await getValueFromDB("server", "gameActive");
		const gameType = await getValueFromDB("server", "gameType");
		const gameName = await getValueFromDB("server", "gameName");

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
