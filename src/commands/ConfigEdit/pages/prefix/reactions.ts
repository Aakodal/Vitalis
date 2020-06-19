import { Message } from "discord.js";
import { changePage } from "../../functions/changePage";
import { editValue } from "../../functions/editValue";
import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";

export function getPrefixReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	const editFilter = (target: Message): boolean => target.content.length <= 5
		&& !target.content.match(/\s+/);

	return ({
		"✏": async (): Promise<void> => editValue(embedMessage, editFilter, "prefix"),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	});
}
