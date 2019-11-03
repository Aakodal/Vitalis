import { Command } from "../lib/Command";
import { Client } from "../lib/Client";
import { Discord } from "../requires";

export default class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Check bot's ping",
		});
	}

	run(message: Discord.Message, args: string[], client: Client) {
		const messageCreatedAt = message.createdTimestamp;
		message.channel.send("Ping?").then((reply: Discord.Message) => {
			const replyCreatedAt = reply.createdTimestamp;
			reply.edit(`🎉 Pong! Took ${Number((replyCreatedAt - messageCreatedAt).toFixed(2))} ms.`);
		});
	}
}
