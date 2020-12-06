import { Guild, Snowflake } from "discord.js";
import * as knex from "knex";
import { DbRecord } from "knex";
import * as path from "path";

import { Client } from "../classes/Client";

const dbPath = path.join(__dirname, "../db.db");

export const db = knex({
	client: "sqlite3",
	connection: {
		filename: dbPath,
	},
	useNullAsDefault: true,
});

export const defaultServerConfig = {
	prefix: "!",
	logs_active: true,
	mod_logs_active: true,
	joining_message_active: false,
	joining_message_text: "Welcome {MENTION} on **{SERVER}**! Try `{PREFIX}help` command for any help.",
	joining_role_active: false,
	leaving_message_active: false,
	leaving_message_text: "{USER} left the server :'(",
};

export interface Infraction {
	id: number;
	discord_id: Snowflake;
	infraction: string;
	type: "warn" | "mute" | "kick" | "ban";
	created: number;
	expiration: number;
	duration: string;
	moderator: string;
}

export interface DbUser {
	server_id: Snowflake;
	discord_id: Snowflake;
	pseudo: string;
	last_warn: number;
	actual_sanction: "muted" | "banned";
	created: number;
	expiration: number;
}

export async function databaseCheck(): Promise<void> {
	const infractionsTableExists = await db.schema.hasTable("infractions");

	if (!infractionsTableExists) {
		await db.schema.createTable("infractions", (table) => {
			table.increments("id").primary();
			table.string("server_id");
			table.string("discord_id");
			table.text("infraction"); // reason
			table.enum("type", ["warn", "mute", "kick", "ban"]);
			table.timestamp("created");
			table.timestamp("expiration");
			table.string("duration");
			table.string("moderator");
		});
		console.info("Infractions table created successfully.");
	}

	const usersTableExists = await db.schema.hasTable("users");

	if (!usersTableExists) {
		await db.schema.createTable("users", (table) => {
			table.string("server_id");
			table.string("discord_id");
			table.primary(["server_id", "discord_id"]);
			table.string("pseudo");
			table.string("lang");
			table.timestamp("last_warn");
			table.enum("actual_sanction", ["muted", "banned"]);
			table.timestamp("created");
			table.timestamp("expiration");
		});
		console.info("Users table created successfully.");
	}

	const serverTableExists = await db.schema.hasTable("servers");

	if (!serverTableExists) {
		await db.schema.createTable("servers", (table) => {
			table.string("server_id").primary();
			table.string("prefix");
			// votes
			table.string("votes_channel");
			// logs
			table.boolean("logs_active");
			table.string("logs_channel");
			// modLogs
			table.boolean("mod_logs_active");
			table.string("mod_logs_channel");
			// joining
			table.boolean("joining_message_active");
			table.string("joining_message_channel");
			table.text("joining_message_text");
			// joining role
			table.boolean("joining_role_active");
			table.string("joining_role_id");
			// leaving
			table.boolean("leaving_message_active");
			table.string("leaving_message_channel");
			table.text("leaving_message_text");
			// mute role
			table.string("mute_role_id");
			// default lang
			table.string("default_lang");
		});
		console.info("Servers table created successfully.");
	}
}

export async function getValueFromDB<T>(table: string, column: string, where?: DbRecord<unknown>): Promise<T> {
	const result = where ? await db.select(column).from(table).where(where) : await db.select(column).from(table);
	return result[0]?.[column];
}

export async function pushValueInDB<T>(table: string, column: string, serverId: string, value: T): Promise<void> {
	await db
		.update({ [column]: value })
		.into(table)
		.where({ server_id: serverId });
}

export async function userExistsInDB(userID: Snowflake, server: Guild, client: Client): Promise<void> {
	const user = await client.users.fetch(userID);

	if (!user) {
		return;
	}

	const userInDB = await db.from("users").where({ server_id: server.id, discord_id: userID });

	if (!userInDB[0]) {
		await db
			.insert({
				server_id: server.id,
				discord_id: userID,
				pseudo: user.tag,
			})
			.into("users");
	}
}
