import { Message } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";

export default class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Check bot's ping",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		const messageCreatedAt = message.createdTimestamp;
		const reply = await message.channel.send("Ping?") as Message;

		const replyCreatedAt = reply.createdTimestamp;
		const ping = Number((replyCreatedAt - messageCreatedAt).toFixed(2));

		await reply.edit(`🎉 Pong! Took ${ping} ms.`);
	}
}
