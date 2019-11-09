import * as fsModule from "fs";
import * as dateFns from "date-fns";
import * as config from "./config.json";
import { Client } from "./lib/Client";
import { databaseCheck } from "./lib/database";
import { sendError, getValueFromDB, pushValueInDB } from "./lib/functions";

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
	const muteRoleDB = server.roles.get(await getValueFromDB("server", "muteRoleID"));
	if (!muteRoleDB) {
		const botRole = server.member(client.user).highestRole;
		const highestRolePosition = botRole.calculatedPosition;
		const muteRole = await server.createRole({
			name: "Muted",
			color: 0x000001,
			hoist: false,
			position: highestRolePosition - 1,
			permissions: ["VIEW_CHANNEL", "CONNECT", "READ_MESSAGE_HISTORY"],
			mentionable: false,
		}, "[AUTO] Mute role not found, created");
		await pushValueInDB("server", "muteRoleID", muteRole.id);
	}

	const muteRole = server.roles.get(await getValueFromDB("server", "muteRoleID"));
	server.channels.forEach((channel) => {
		if(!channel.permissionsFor(muteRole)) {
			channel.overwritePermissions(muteRole, {
				"ADD_REACTIONS": false,
				"ATTACH_FILES": false,
				"SEND_MESSAGES": false,
				"SEND_TTS_MESSAGES": false,
				"SPEAK": false
			});
		}
	})
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
		if (!command.permission) {
			return command.run(message, args, client);
		}
		if (command.permission.toUpperCase() === "BOT_OWNER") {
			if (message.author.id !== config.botOwner) return;
			return command.run(message, args, client);
		}
		if (message.member.hasPermission(command.permission)) {
			return command.run(message, args, client);
		}
	} catch (error) {
		return sendError(error, message.channel);
	}
});
