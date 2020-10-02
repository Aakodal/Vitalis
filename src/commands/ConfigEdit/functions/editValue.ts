import { Message } from "discord.js";

import { sendError } from "../../../functions/sendError";
import { pushValueInDB } from "../../../misc/database";
import { EmbedMessage } from "../index";
import { changePage } from "./changePage";

export async function editValue(
	source: EmbedMessage,
	filter: (message: Message) => boolean,
	column: string,
	transformation?: (value: string) => string | undefined,
): Promise<void> {
	const collectorFilter = (message: Message): boolean =>
		message.channel === source.message.channel && message.author === source.author && !message.author.bot;

	await source.message.reactions.removeAll();
	await source.message.edit("You have 30 seconds to input the value you want. Type `$cancel` to cancel.");
	await source.message.suppressEmbeds();

	const collected = await source.message.channel.awaitMessages(collectorFilter, { max: 1, time: 30000 });
	const message = collected.first();

	if (!message || message.content === "$cancel") {
		return changePage(source);
	}
	if (!filter(message)) {
		(
			await message.channel.send("Provided value is not valid (maybe it's too long or not the right type?).")
		).delete({
			timeout: 5000,
		});
		return changePage(source);
	}

	try {
		await pushValueInDB<string>(
			"servers",
			column,
			message.guild?.id as string,
			transformation?.(message.content) || message.content,
		);
	} catch (error) {
		await sendError(source.message, error);
	}

	try {
		await message.delete();
	} catch {}

	await changePage(source);
}
