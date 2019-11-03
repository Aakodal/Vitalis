import Discord = require("discord.js");

class Client extends Discord.Client {
	commands: Discord.Collection<string, object>;

	aliases: Discord.Collection<string, object>;

	constructor() {
		super();

		this.commands = new Discord.Collection();
		this.aliases = new Discord.Collection();
	}

	async loadCommand(commandName: string) {
		try {
			const { default: CommandClass } = await import(`../commands/${commandName}`);
			const command = new CommandClass();
			if (!command.name) return;
			if (this.commands.has(command.name)) {
				return console.log(`Command ${command.name} in ${commandName} already exists. Skipping...`);
			}
			this.commands.set(command.name, command);
			console.log(`Command ${command.name} loaded.`);
			command.aliases.forEach((alias: string) => {
				if (this.aliases.has(alias)) {
					return console.log(`Alias ${alias} already exist for command ${this.aliases.get(alias)}.`);
				}
				this.aliases.set(alias, command);
			});
		} catch (error) {
			return console.log(`Error when trying to load command ${commandName} ; ${error}`);
		}
	}

	reloadCommand(commandName: string) {
		try {
			const command = this.commands.get(commandName);
			if (!command) throw new Error(`${commandName} does not exist.`);
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
}

export { Client };
