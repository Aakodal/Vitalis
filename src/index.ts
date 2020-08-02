import { PermissionResolvable } from "discord.js";
import * as config from "./config.json";
import { Client } from "./classes/Client";
import { getValueFromDB } from "./functions/getValueFromDB";
import { sendError } from "./functions/sendError";
import { db } from "./lib/database";

const client = new Client({
	partials: ["USER", "GUILD_MEMBER", "MESSAGE", "REACTION"],
	ws: {
		intents: [
			"GUILDS", "GUILD_PRESENCES", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS",
		],
	},
});

client.init();

client.on("guildCreate", client.initServer);

client.on("guildDelete", async (guild) => {
	for (const table of ["infractions", "users", "servers"]) {
		await db.from(table).where({ server_id: guild.id }).delete();
	}
});

client.on("message", async (message) => {
	if (!client.operational || message.author.bot || !message.guild) {
		return;
	}

	if (message.author.partial) {
		await message.author.fetch();
	}

	if (message.member?.partial) {
		await message.member.fetch();
	}

	const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild.id });

	if (!message.content.startsWith(prefix)) {
		return;
	}

	const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
	const commandNameLower = commandName.toLowerCase();

	const command = client.commands.get(commandNameLower) || client.aliases.get(commandNameLower);

	if (!command) {
		return;
	}

	const isOwner =	command.informations.permission
		&& (command.informations.permission as string).toUpperCase() === "BOT_OWNER"
		&& message.author.id === config.botOwner;

	if (
		!command.informations.permission
		|| isOwner
		|| message.member?.hasPermission(command.informations.permission as PermissionResolvable)
	) {
		try {
			await message.delete();
		} catch {}

		try {
			await command.run(message, args, client);
		} catch (error) {
			try {
				await sendError(message, error);
			} catch {}
		}
	}
});

export { client };
