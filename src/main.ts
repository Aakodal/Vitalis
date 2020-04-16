import { PermissionResolvable } from "discord.js";
import * as config from "./config.json";
import { Client } from "./classes/Client";
import { db } from "./lib/database";
import { getValueFromDB } from "./functions/getValueFromDB";
import { sendError } from "./functions/sendError";
import { unsanction } from "./functions/unsanction";
import { getMuteRole } from "./functions/getMuteRole";
import { formatDate } from "./functions/formatDate";

const client = new Client({ partials: ["USER", "GUILD_MEMBER", "MESSAGE", "REACTION"] });

client.init();

client.on("ready", async () => {
	await client.updatePresence();

	console.log(`Vitalis started at ${formatDate()}`);

	const server = client.guilds.cache.array()[0];
	await getMuteRole(server);

	const sanctionned = await db.from("users").whereIn("actual_sanction", ["muted", "banned"]);
	for (const user of sanctionned) {
		if (user.expiration) await unsanction(user.discord_id, server, user.actual_sanction);
	}
});

client.on("message", async (message) => {
	const prefix = await getValueFromDB<string>("server", "prefix");

	if (message.author.partial) await message.author.fetch();

	if (!message.content.startsWith(prefix)
        || message.author.bot
        || !message.guild) return;

	const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
	const commandNameLower = commandName.toLowerCase();
	if (!client.commands.has(commandNameLower) && !client.aliases.has(commandNameLower)) return;

	const command = client.commands.get(commandNameLower) || client.aliases.get(commandNameLower);

	const isOwner = command.informations.permission
		&& (command.informations.permission as string).toUpperCase() === "BOT_OWNER"
		&& message.author.id === config.botOwner;

	if (
		!command.informations.permission
		|| isOwner
		|| message.member.hasPermission(command.informations.permission as PermissionResolvable)
	) {
		try {
			command.run(message, args, client);
			return await message.delete();
		} catch (error) {
			return sendError(error, message.channel);
		}
	}
});

export { client };
