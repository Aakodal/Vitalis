import { Message } from "discord.js";
import { Command } from "../lib/Command";
import { Client } from "../lib/Client";
import { fromArrayToLone } from "../lib/functions";

export default class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Check bot's ping",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		const messageCreatedAt = message.createdTimestamp;
		const botMessage = await message.channel.send("Ping?");

		const reply = fromArrayToLone(botMessage);

		const replyCreatedAt = reply.createdTimestamp;
		const ping = Number((replyCreatedAt - messageCreatedAt).toFixed(2));

		reply.edit(`🎉 Pong! Took ${ping} ms.`);
	}
}
