import { promises as fs } from "fs";
import { PermissionString } from "discord.js";
import * as dateFns from "date-fns";
import * as config from "./config.json";
import { Client } from "./classes/Client";
import { databaseCheck, db } from "./lib/database";
import { getValueFromDB } from "./functions/getValueFromDB";
import { sendError } from "./functions/sendError";
import { unsanction } from "./functions/unsanction";
import { getMuteRole } from "./functions/getMuteRole";

const client = new Client();
export { client };

client.login(config.token);

databaseCheck();

fs.readdir("./commands/").then((folders) => {
	folders.forEach(async (folder: string) => {
		const folderFiles = await fs.readdir(`./commands/${folder}/`);
		for (const file of folderFiles) {
			await client.loadCommand(folder, file);
		}
	});
});

fs.readdir("./events/").then((files) => {
	files.forEach((file: string) => {
		import(`./events/${file}`);
	});
});

client.on("ready", async () => {
	await client.updatePresence();

	const currentTime = dateFns.format(Date.now(), "H:mm:ss");
	console.log(`Vitalis started at ${currentTime}`);

	const server = client.guilds.array()[0];
	await getMuteRole(server);

	const sanctionned = await db.from("users").whereIn("actual_sanction", ["muted", "banned"]);
	for (const user of sanctionned) {
		if (user.expiration) await unsanction(user.discord_id, server, user.actual_sanction);
	}
});

client.on("message", async (message) => {
	const prefix = await getValueFromDB<string>("server", "prefix");

	if (!message.content.startsWith(prefix)
        || message.author.bot
        || !message.guild) return;

	const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
	const commandNameLower = commandName.toLowerCase();
	if (!client.commands.has(commandNameLower) && !client.aliases.has(commandNameLower)) return;

	const command = client.commands.get(commandNameLower) || client.aliases.get(commandNameLower);

	try {
		const isOwner = command.permission
			&& command.permission.toUpperCase() === "BOT_OWNER"
			&& message.author.id === config.botOwner;

		if (
			!command.permission
			|| isOwner
			|| message.member.hasPermission(command.permission as PermissionString)
		) {
			command.run(message, args, client);
			return await message.delete();
		}
	} catch (error) {
		return sendError(error, message.channel);
	}
});
