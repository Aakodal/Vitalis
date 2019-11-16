import * as fsModule from "fs";
import * as dateFns from "date-fns";
import * as config from "./config.json";
import { Client } from "./lib/Client";
import { databaseCheck, db } from "./lib/database";
import {
	sendError, getValueFromDB, getMuteRole, unsanction,
} from "./lib/functions";

const client = new Client();
export { client };

const fs = fsModule.promises;

client.login(config.token);

databaseCheck();

fs.readdir("./commands/").then((files) => {
	files.forEach(async (file: string) => {
		await client.loadCommand(file);
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
		await unsanction(user.discord_id, server, user.actual_sanction, false);
	}
});

client.on("message", async (message) => {
	const prefix = await getValueFromDB("server", "prefix");

	if (!message.content.startsWith(prefix)
        || message.author.bot
        || !message.guild) return;

	const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
	const commandNameLower = commandName.toLowerCase();
	if (!client.commands.has(commandNameLower) && !client.aliases.has(commandNameLower)) return;

	const command: any = client.commands.get(commandNameLower) || client.aliases.get(commandNameLower);

	try {
		const isOwner = command.permission.toUpperCase() === "BOT_OWNER"
			&& message.author.id === config.botOwner;

		if (
			!command.permission
			|| isOwner
			|| message.member.hasPermission(command.permission)
		) {
			command.run(message, args, client);
			return await message.delete();
		}
	} catch (error) {
		return sendError(error, message.channel);
	}
});
