import {
	ActivityType,
	Client as DiscordClient,
	ClientOptions,
	Guild,
	GuildMember,
	MessageEmbed,
	PresenceData,
	PresenceStatusData,
	Snowflake,
	User,
	UserResolvable,
} from "discord.js";
import { readdir, readFile } from "fs/promises";
import * as path from "path";

import { CommandError } from "../exceptions/CommandError";
import { DatabaseError } from "../exceptions/DatabaseError";
import { capitalize } from "../functions/capitalize";
import { formatDate } from "../functions/formatDate";
import { log } from "../functions/log";
import { longTimeout } from "../functions/longTimeout";
import { getMuteRole } from "../functions/muteRole";
import { COLORS } from "../misc/constants";
import { databaseCheck, db, DbUser, defaultServerConfig, userExistsInDB } from "../misc/database";
import { Command } from "./Command";
import { Event } from "./Event";

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
		const configPath = path.join(__dirname, "../config.json");
		const config = JSON.parse(await readFile(configPath, "utf-8"));

		if (!config.botOwner || !config.botOwner.match(/^\d+$/)) {
			console.warn(`Owner's ID is undefined or invalid.`);
		}

		try {
			await databaseCheck();
		} catch (error) {
			throw new DatabaseError(`Could not check database; ${error.message}`);
		}

		const commandsPath = path.join(__dirname, "../commands/");
		const commandsFolders = await readdir(commandsPath).catch(() => null);
		if (commandsFolders) {
			for (const folder of commandsFolders) {
				const commandPath = path.join(commandsPath, folder);
				try {
					await this.loadCommand(commandPath);
				} catch (error) {
					console.error(`Could not load command in ${folder};\n${error.stackTrace}`);
				}
			}
		}

		const eventsPath = path.join(__dirname, "../events/");
		const eventsFolders = await readdir(eventsPath).catch(() => null);
		if (eventsFolders) {
			for (const folder of eventsFolders) {
				const eventPath = path.join(eventsPath, folder);
				try {
					await this.loadEvent(eventPath, folder);
				} catch (error) {
					console.error(`Could not load event in ${folder};\n${error.stackTrace}`);
				}
			}
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

				await this.unsanction(user.discord_id, guild, user.actual_sanction);
			}
		}

		this.on("guildCreate", this.initServer);
		this.on("guildDelete", async (guild) => {
			for (const table of ["infractions", "users", "servers"]) {
				await db.from(table).where({ server_id: guild.id }).delete();
			}
		});

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
		const command: Command = new CommandClass(this);

		if (!command.informations.name) {
			return console.info(`Command in '${filePath}' does not have any name. Skipping...`);
		}

		if (this.commands.has(command.informations.name)) {
			return console.info(`Command ${command.informations.name} in '${filePath}' already exists. Skipping...`);
		}

		this.commands.set(command.informations.name, command);

		const category = capitalize(command.informations.category || "Misc");
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

	private async loadEvent(eventPath: string, name: string): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { default: EventClass } = await import(eventPath);
		const event: Event = new EventClass(this);

		this.on(event.event, event.listener.bind(event));

		console.info(`Event ${name} (${event.event}) loaded.`);
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
		const configPath = path.join(__dirname, "../config.json");
		const config = JSON.parse(await readFile(configPath, "utf-8"));
		const { active, name, type } = config.game;
		const presence: PresenceData = {
			activity: {
				name,
				type: type as ActivityType,
			},
		};

		if (active) {
			await this.user?.setPresence(presence);
		}
		await this.user?.setStatus((config.status as PresenceStatusData) || "online");
	}

	async initServer(server: Guild): Promise<void> {
		const dbServer = await db.from("servers").where({ server_id: server.id });
		if (!dbServer[0]) {
			await db.insert({ ...defaultServerConfig, server_id: server.id }).into("servers");
		}

		try {
			await getMuteRole(server, this);
		} catch {
			try {
				await server.owner?.send(`[${server.name}] Vitalis doesn't have sufficent permissions to work.`);
			} catch {}
		}
	}

	async fetchMember(guild: Guild, user: UserResolvable): Promise<GuildMember | undefined> {
		try {
			return await guild.members.fetch(user || "1");
		} catch {}
	}

	async fetchUser(id: Snowflake | string): Promise<User | undefined> {
		try {
			return await this.users.fetch(id);
		} catch {}
	}

	async unsanction(
		id: Snowflake,
		server: Guild,
		sanction: string,
		forced = false,
	): Promise<number | NodeJS.Timeout | void> {
		await userExistsInDB(id, server, this);
		const user = (
			await db.from("users").where({ server_id: server.id, discord_id: id, actual_sanction: sanction })
		)[0] as DbUser;

		if (!user) {
			return;
		}

		const { expiration } = user;
		const now = Date.now();

		if (expiration && now < expiration && !forced) {
			return longTimeout(() => {
				this.unsanction(id, server, sanction);
			}, expiration - now);
		}

		const baseEmbed = new MessageEmbed()
			.setAuthor("Moderation", server.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTimestamp();

		const autoEmbed = new MessageEmbed(baseEmbed)
			.setColor(COLORS.gold)
			.setDescription(`[AUTO] ${user.pseudo} has been un${sanction} (sanction timeout).`);

		if (sanction === "muted") {
			const member = await this.fetchMember(server, id);
			const muteRole = await getMuteRole(server, this);

			if (member && muteRole && member.roles.cache.get(muteRole.id)) {
				await member.roles.remove(muteRole);
			}

			await db
				.update({
					actual_sanction: null,
					created: null,
					expiration: null,
				})
				.into("users")
				.where({ server_id: server.id, discord_id: id });

			const unmuteEmbed = new MessageEmbed(baseEmbed)
				.setTitle("Unmute")
				.setDescription(`You have been unmuted from ${server.name}.`);
			await member?.send(unmuteEmbed).catch(() => {});

			if (!forced) {
				await log("mod_log", autoEmbed, server, this);
			}

			return;
		}
		// else
		const bans = await server.fetchBans();
		if (!bans.get(id)) {
			return;
		}

		await server.members.unban(id, "[AUTO] Sanction finished.");
		await db
			.update({
				actual_sanction: null,
				created: null,
				expiration: null,
			})
			.into("users")
			.where({ server_id: server.id, discord_id: id });

		if (!forced) {
			await log("mod_log", autoEmbed, server, this);
		}
	}
}

export { Client };
