import * as knex from "knex";
import * as path from "path";
import { getValueFromDB } from "../functions/getValueFromDB";

const dbPath = path.join(__dirname, "../db.db");

const db = knex({
	client: "sqlite3",
	connection: {
		filename: dbPath,
	},
	useNullAsDefault: true,
});

async function databaseCheck() {
	const infractionsTableExists = await db.schema.hasTable("infractions");

	if (!infractionsTableExists) {
		await db.schema.createTable("infractions", (table) => {
			table.increments("id").primary();
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
			table.increments("id").primary();
			table.string("discord_id");
			table.string("pseudo");
			table.timestamp("last_warn");
			table.enum("actual_sanction", ["muted", "banned"]);
			table.timestamp("created");
			table.timestamp("expiration");
		});
		console.info("Users table created successfully.");
	}

	const serverTableExists = await db.schema.hasTable("server");

	if (!serverTableExists) {
		await db.schema.createTable("server", (table) => {
			table.increments("id").primary();
			table.string("prefix");
			// activity
			table.enum("status", ["online", "idle", "invisible", "dnd"]);
			table.boolean("gameActive");
			table.enum("gameType", ["PLAYING", "LISTENING", "WATCHING", "STREAMING"]);
			table.string("gameName");
			// votes
			table.string("votesChannel");
			// logs
			table.boolean("logsActive");
			table.string("logsChannel");
			// modLogs
			table.boolean("modlogsActive");
			table.string("modlogsChannel");
			// welcome
			table.boolean("welcomeMessageActive");
			table.string("welcomeMessageChannel");
			table.text("welcomeMessageText");
			// welcome role
			table.boolean("welcomeRoleActive");
			table.string("welcomeRoleID");
			// leaving
			table.boolean("leavingMessageActive");
			table.string("leavingMessageChannel");
			table.text("leavingMessageText");
			// muterole
			table.string("muteRoleID");
		});
		await db.insert({
			prefix: "!",
			status: "online",
			gameActive: true,
			gameType: "LISTENING",
			gameName: "{PREFIX}help",
			logsActive: true,
			modlogsActive: true,
			welcomeMessageActive: false,
			welcomeMessageText: "Welcome {MENTION} on **{SERVER}**! Try `{PREFIX}help` command for any help.",
			welcomeRoleActive: false,
			leavingMessageActive: false,
			leavingMessageText: "{USER} left the server :'c",
		}).into("server");
		console.info("Server table created successfully.");
	}

	const actualPrefix = await getValueFromDB<string>("server", "prefix");
	if (actualPrefix) return;
	await db.insert({
		prefix: "!",
	}).into("server");
}

export { db, databaseCheck };
