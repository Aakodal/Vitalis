import { react } from "../../../functions/react";
import { EmbedMessage } from "../index";
import { reactionsHandler } from "./reactionsHandler";

export async function changePage(target: EmbedMessage): Promise<void> {
	const {
		message, embed, reactions,
	} = target;
	await message.edit("", await embed(message));

	await message.reactions.removeAll();
	await react(reactions, message);

	await reactionsHandler(target);
}
