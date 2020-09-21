import { Message, MessageEmbed, User } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { react } from "../../functions/react";
import { reactionsHandler } from "./functions/reactionsHandler";
import { getMainEmbed } from "./pages/main/embed";
import { getMainReactionsEffects } from "./pages/main/reactions";

export type ReactionsEffects = Record<string, () => void | Promise<void>>;

export interface EmbedMessage {
	message: Message;
	author: User;
	embed: (embedMessage: Message) => MessageEmbed | Promise<MessageEmbed>;
	reactions: string;
	reactionsEffects: () => ReactionsEffects;
}

export function getMainEmbedMessage(message: Message, author: User): EmbedMessage {
	return {
		message,
		author,
		embed: getMainEmbed,
		reactions: "❗📝📑📃🔨⚒📥📜🖊️⚜️💠📤📄🖋️🤐✅",
		reactionsEffects: (): ReactionsEffects => getMainReactionsEffects(message, author),
	};
}

export default class ConfigEdit extends Command {
	constructor(client: Client) {
		super(
			{
				name: "configedit",
				description: "Edit configuration",
				category: "Administration",
				aliases: ["editconfig"],
				permission: "ADMINISTRATOR",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const mainEmbed = getMainEmbed(message);
		const embedMessage = await message.channel.send(mainEmbed);
		const mainEmbedMessage = getMainEmbedMessage(embedMessage, message.author);

		const { reactions } = mainEmbedMessage;
		await react(reactions, embedMessage);

		await reactionsHandler(mainEmbedMessage);
	}
}
