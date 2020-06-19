import { Message } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { DiscordError } from "../../exceptions/DiscordError";

export default class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Check bot's ping",
			category: "Misc",
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const messageCreatedAt = message.createdTimestamp;
		const reply = await message.channel.send("Ping?");

		const replyCreatedAt = reply.createdTimestamp;
		const ping = Number((replyCreatedAt - messageCreatedAt).toFixed(2));

		try {
			await reply.edit(`🎉 Pong! Took ${ping} ms.`);
		} catch (error) {
			throw new DiscordError(`Message cannot be edited; ${error.message}`);
		}
	}
}
