import { Message, PermissionResolvable } from "discord.js";
import { readFile } from "fs/promises";
import * as path from "path";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import { sendError } from "../../functions/sendError";
import { getValueFromDB } from "../../misc/database";

export default class Command extends Event {
	constructor(client: Client) {
		super("message", client);
	}

	async listener(message: Message): Promise<void> {
		if (!this.client.operational || message.author.bot || !message.guild) {
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

		const command = this.client.commands.get(commandNameLower) || this.client.aliases.get(commandNameLower);

		if (!command) {
			return;
		}

		const configPath = path.join(__dirname, "../config.json");
		const config = JSON.parse(await readFile(configPath, "utf-8"));

		const isOwner =
			command.informations.permission &&
			(command.informations.permission as string).toUpperCase() === "BOT_OWNER" &&
			message.author.id === config.botOwner;

		if (
			!command.informations.permission ||
			isOwner ||
			message.member?.hasPermission(command.informations.permission as PermissionResolvable)
		) {
			await message.delete().catch(() => {});

			try {
				await command.run(message, args);
			} catch (error) {
				await sendError(message, error, this.client).catch(() => {});
			}
		}
	}
}
