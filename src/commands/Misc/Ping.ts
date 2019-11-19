import { Message } from "discord.js";
import { Command } from "../../lib/Command";
import { Client } from "../../lib/Client";
import { fromArrayToLone } from "../../functions/fromArrayToLone";

export default class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Check bot's ping",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		const messageCreatedAt = message.createdTimestamp;
		const botMessage: Message | Message[] = await message.channel.send("Ping?");

		const reply: Message = fromArrayToLone(botMessage);

		const replyCreatedAt = reply.createdTimestamp;
		const ping = Number((replyCreatedAt - messageCreatedAt).toFixed(2));

		await reply.edit(`🎉 Pong! Took ${ping} ms.`);
	}
}
