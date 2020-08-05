import {
	ActivityType, Client as DiscordClient, ClientOptions, Guild, PresenceData, PresenceStatusData,
} from "discord.js";
import { promises as fs } from "fs";
import * as path from "path";
import { Command } from "./Command";
import { stringNormalize } from "../functions/stringNormalize";
import {
	databaseCheck, db, DbUser, defaultServerConfig,
} from "../lib/database";
import * as config from "../config.json";
import { DatabaseError } from "../exceptions/DatabaseError";
import { CommandError } from "../exceptions/CommandError";
import { getMuteRole } from "../functions/getMuteRole";
import { unsanction } from "../functions/unsanction";
import { formatDate } from "../functions/formatDate";

class Client extends DiscordClient {
	commands: Map<string, Command>;

	aliases: Map<string, Command>;

	operational: boolean;

	constructor(options?: ClientOptions) {
		super(options);

		this.commands = new Map();
		this.aliases = new Map();

		this.operational = false;
	}

	async init(): Promise<void> {
		if (!config.botOwner || !config.botOwner.match(/^\d+$/)) {
			console.warn(`Owner's ID is undefined or invalid.`);
		}

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
				console.error(`Could not load command in ${folder};\n${error.stackTrace}`);
			}
		}

		const eventsPath = path.join(__dirname, "../events/");
		const eventsFolders = await fs.readdir(eventsPath);
		for (const folder of eventsFolders) {
			const eventPath = path.join(eventsPath, folder);
			import(eventPath);
		}

		await this.login(config.token);
		await this.user?.setPresence({
			activity: {
				name: "starting...",
				type: "PLAYING",
			},
			status: "dnd",
		});

		const servers = Array.from(this.guilds.cache.values());

		if (servers.length > 0) {
			for (const server of servers) {
				await this.initServer(server);
			}

			const sanctionned: DbUser[] = await db.from("users").whereIn("actual_sanction", ["muted", "banned"]);
			for (const user of sanctionned) {
				if (!user.expiration) {
					continue;
				}

				const guild = this.guilds.cache.get(user.server_id);
				if (!guild) {
					continue;
				}

				await unsanction(user.discord_id, guild, user.actual_sanction);
			}
		}

		this.operational = true;

		try {
			await this.updatePresence();
		} catch (error) {
			console.error(`Error while updating bot's presence: invalid config.\n${error}`);
		}
		console.log(`Vitalis started at ${formatDate()}.`);
	}

	private async loadCommand(filePath: string): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { default: CommandClass } = await import(filePath);
		const command: Command = new CommandClass();

		if (!command.informations.name) {
			return console.log(`Command in '${filePath}' does not have any name. Skipping...`);
		}

		if (this.commands.has(command.informations.name)) {
			return console.info(`Command ${command.informations.name} in '${filePath}' already exists. Skipping...`);
		}

		this.commands.set(command.informations.name, command);

		const category = stringNormalize(command.informations.category || "Misc");
		command.setCategory(category);
		command.setPath(filePath);

		console.info(`Command ${command.informations.name} loaded.`);

		if (!command.informations.aliases) {
			return;
		}

		for (const alias of command.informations.aliases) {
			const double = this.aliases.get(alias) || this.commands.get(alias);
			if (double) {
				console.warn(`Alias ${alias} already exist for command ${double.informations.name}.`);
				continue;
			}
			this.aliases.set(alias, command);
		}
	}

	reloadCommand(command: Command): Promise<void> {
		for (const [key, value] of this.aliases) {
			if (value === command) {
				this.aliases.delete(key);
			}
		}

		try {
			this.commands.delete(command.informations.name);
			delete require.cache[require.resolve(command.informations.path as string)];

			return this.loadCommand(command.informations.path as string);
		} catch (error) {
			throw new CommandError(`Could not reload command ${command.informations.name}; ${error}`);
		}
	}

	async updatePresence(): Promise<void> {
		const configUpdated = await import("../config.json");
		const { active, name, type } = configUpdated.game;
		const presence: PresenceData = {
			activity: {
				name,
				type: type as ActivityType,
			},
		};

		if (active) {
			await this.user?.setPresence(presence);
		}
		await this.user?.setStatus((configUpdated.status as PresenceStatusData) || "online");
	}

	async initServer(server: Guild): Promise<void> {
		const dbServer = await db.from("servers").where({ server_id: server.id });
		if (!dbServer[0]) {
			await db.insert({ ...defaultServerConfig, server_id: server.id }).into("servers");
		}

		try {
			await getMuteRole(server);
		} catch {
			try {
				await server.owner?.send(`[${server.name}] Vitalis doesn't have sufficent permissions to work.`);
			} catch {}
		}
	}
}

export { Client };
