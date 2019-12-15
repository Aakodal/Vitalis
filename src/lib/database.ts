import * as knex from "knex";
import { promises as fs } from "fs";

fs.stat("../db.db").then((stat) => {
	if (!stat) fs.writeFile("../db.db", "");
}).catch(() => {});

const db = knex({
	client: "sqlite3",
	connection: {
		filename: "./db.db",
	},
	useNullAsDefault: true,
});

async function databaseCheck() {
	await db.schema.hasTable("infractions").then((exists) => {
		if (!exists) {
			db.schema.createTable("infractions", (table) => {
				table.increments("id").primary();
				table.string("discord_id");
				table.text("infraction");									// reason
				table.enum("type", ["warn", "mute", "kick", "ban"]);
				table.timestamp("created");
				table.timestamp("expiration");
				table.string("duration");
				table.string("moderator");
			}).then(() => {
				console.log("Infractions table created successfully.");
			}).catch((error) => {
				console.error(error);
			});
		}
	});

	await db.schema.hasTable("users").then((exists) => {
		if (!exists) {
			db.schema.createTable("users", (table) => {
				table.increments("id").primary();
				table.string("discord_id");
				table.string("pseudo");
				table.timestamp("last_warn");
				table.enum("actual_sanction", ["muted", "banned"]);
				table.timestamp("created");
				table.timestamp("expiration");
			}).then(() => {
				console.log("Users table created successfully.");
			}).catch((error) => {
				console.error(error);
			});
		}
	});

	await db.schema.hasTable("server").then(async (exists) => {
		if (!exists) {
			try {
				await db.schema.createTable("server", (table) => {
					table.increments("id").primary();
					table.string("prefix");
					// activity
					table.enum("status", ["online", "idle", "offline", "dnd"]);
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
				console.log("Server table created successfully.");
			} catch (error) {
				console.error(error);
			}
		}
	});
}

export { db, databaseCheck };
