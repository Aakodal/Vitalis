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
import { readdir } from "fs/promises";
import { get } from "lodash";
import * as path from "path";

import { DatabaseError } from "../exceptions/DatabaseError";
import { capitalize, formatDate, getMuteRole, log, longTimeout, validEnv } from "../functions";
import { FormattedString } from "../i18n";
import { COLORS } from "../misc/constants";
import { databaseCheck, db, DbUser, defaultServerConfig, getValueFromDB, userExistsInDB } from "../misc/database";
import { Command } from "./Command";
import { Event } from "./Event";

const classSymbol = Symbol("client");

class Client extends DiscordClient {
	public commands: Map<string, Command> = new Map();

	public aliases: Map<string, Command> = new Map();

	public locales: Map<string, Record<string, unknown>> = new Map();

	public operational = false;

	private constructor(key: symbol, options?: ClientOptions) {
		super(options);
		if (key !== classSymbol) {
			throw new Error("This class cannot be directly instancied");
		}
	}

	static async create(options?: ClientOptions): Promise<void> {
		if (!validEnv()) {
			throw new Error("Environment is not valid. Make sure TOKEN and BOT_OWNER variables are set.");
		}

		await databaseCheck().catch((error) => {
			throw new DatabaseError(`Could not check database; ${error.message}`);
		});

		const instance = new Client(classSymbol, options);

		const commandsPath = path.join(__dirname, "../commands/");
		const commandsFolders = await readdir(commandsPath).catch(() => null);
		if (commandsFolders) {
			for (const folder of commandsFolders) {
				const commandPath = path.join(commandsPath, folder);
				await instance
					.loadCommand(commandPath)
					.catch((error) => console.error(`Could not load command in ${folder};\n${error.stackTrace}`));
			}
		}

		const eventsPath = path.join(__dirname, "../events/");
		const eventsFolders = await readdir(eventsPath).catch(() => null);
		if (eventsFolders) {
			for (const folder of eventsFolders) {
				const eventPath = path.join(eventsPath, folder);
				await instance
					.loadEvent(eventPath, folder)
					.catch((error) => console.error(`Could not load event in ${folder};\n${error.stackTrace}`));
			}
		}

		await instance.fetchLocales();

		await instance.login(process.env.TOKEN!);

		const servers = [...instance.guilds.cache.values()];

		if (servers.length > 0) {
			for (const server of servers) {
				await instance.initServer(server);
			}

			const sanctionned: DbUser[] = await db.from("users").whereIn("actual_sanction", ["muted", "banned"]);
			for (const user of sanctionned) {
				if (!user.expiration) {
					continue;
				}

				const guild = instance.guilds.cache.get(user.server_id);
				if (!guild) {
					continue;
				}

				await instance.unsanction(user.discord_id, guild, user.actual_sanction);
			}
		}

		instance.on("guildCreate", instance.initServer);
		instance.on("guildDelete", async (guild) => {
			for (const table of ["infractions", "users", "servers"]) {
				await db.from(table).where({ server_id: guild.id }).delete();
			}
		});

		instance.operational = true;

		await instance
			.updatePresence()
			.catch((error) => console.error(`Error while updating bot's presence: invalid config.\n${error}`));
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
				console.warn(
					// eslint-disable-next-line max-len
					`Alias ${alias} from ${command.informations.name} already exist for command ${double.informations.name}. Skipping...`,
				);
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

	private async fetchLocales(): Promise<void> {
		const localesPath = path.join(__dirname, "../i18n/locales/");
		const localesFiles = await readdir(localesPath).catch(() => null);
		if (localesFiles) {
			for (const file of localesFiles) {
				const { locale } = await import(path.join(localesPath, file));
				this.locales.set(file.split(".")[0], locale);
			}
		}
	}

	getTranslation(
		locale: string | undefined,
		key: string,
		...values: (string | Record<string, unknown>)[]
	): string | undefined {
		if (!locale) {
			return;
		}

		const translation =
			(get(this.locales.get(locale), key) as FormattedString) ||
			(get(this.locales.get("en_us"), key) as FormattedString);

		return typeof translation === "function" ? translation(...values) : translation;
	}

	async updatePresence(): Promise<void> {
		const [status, active, name, type] = [
			process.env.STATUS,
			process.env.GAME_ACTIVE,
			process.env.GAME_NAME,
			process.env.GAME_TYPE,
		];
		const presence: PresenceData = {
			activity: {
				name: name || "users",
				type: (type as ActivityType) || "LISTENING",
			},
		};

		if (Number(active)) {
			await this.user?.setPresence(presence);
		}
		await this.user?.setStatus((status as PresenceStatusData) || "online");
	}

	private async initServer(server: Guild): Promise<void> {
		const dbServer = await db.from("servers").where({ server_id: server.id });
		if (!dbServer[0]) {
			await db.insert({ ...defaultServerConfig, server_id: server.id }).into("servers");
		}

		try {
			await getMuteRole(server, this);
		} catch {
			const locale = await getValueFromDB<string>("servers", "default_lang", {
				server_id: server.id,
			}).catch(() => undefined);
			const text = this.getTranslation(locale, "misc.noPermissions", { server: server.name });
			if (text) {
				await server.owner?.send(text).catch(() => {});
			}
		}
	}

	async fetchMember(guild: Guild, user: UserResolvable): Promise<GuildMember | undefined> {
		return guild.members.fetch(user || "1").catch(() => undefined);
	}

	async fetchUser(id: Snowflake | string): Promise<User | undefined> {
		return this.users.fetch(id).catch(() => undefined);
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
		)?.[0] as DbUser | undefined;

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

		const locale = await getValueFromDB<string>("servers", "default_lang", { server_id: server.id });

		const baseAuthor = this.getTranslation(locale, "moderation.name");
		const baseEmbed = new MessageEmbed()
			.setAuthor(baseAuthor, server.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTimestamp();

		const autoDescription = this.getTranslation(locale, `sanction.unsanction.auto.${sanction}`, user.pseudo);
		const autoEmbed = new MessageEmbed(baseEmbed).setColor(COLORS.gold).setDescription(autoDescription);

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

			const unmuteTitle = this.getTranslation(locale, "sanction.unsanction.unmute");
			const unmuteDescription = this.getTranslation(locale, `sanction.unsanction.mp.${sanction}`, server.name);
			const unmuteEmbed = new MessageEmbed(baseEmbed).setTitle(unmuteTitle).setDescription(unmuteDescription);
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

		const unbanReason = this.getTranslation(locale, "sanction.unsanction.auto.unbanReason");
		await server.members.unban(id, unbanReason);
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
