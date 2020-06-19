import { Message } from "discord.js";
import { changePage } from "../../functions/changePage";
import { editValue } from "../../functions/editValue";
import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";

export function getLeavingMessageReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	const editFilter = (target: Message): boolean => target.content.length <= 200;

	return ({
		"✏": async (): Promise<void> => editValue(embedMessage, editFilter, "leaving_message_text"),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	});
}
