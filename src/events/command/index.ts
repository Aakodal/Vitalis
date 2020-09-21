import { Message, PermissionResolvable } from "discord.js";

import { Client } from "../../classes/Client";
import { Event } from "../../classes/Event";
import * as config from "../../config.json";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { sendError } from "../../functions/sendError";

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

		const isOwner =
			command.informations.permission &&
			(command.informations.permission as string).toUpperCase() === "BOT_OWNER" &&
			message.author.id === config.botOwner;

		if (
			!command.informations.permission ||
			isOwner ||
			message.member?.hasPermission(command.informations.permission as PermissionResolvable)
		) {
			try {
				await message.delete();
			} catch {}

			try {
				await command.run(message, args);
			} catch (error) {
				try {
					await sendError(message, error);
				} catch {}
			}
		}
	}
}
