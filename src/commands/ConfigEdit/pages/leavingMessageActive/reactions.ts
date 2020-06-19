import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";
import { changePage } from "../../functions/changePage";
import { toggleValue } from "../../functions/toggleValue";

export function getLeavingMessageActiveReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	return ({
		"🔄": async (): Promise<void> => toggleValue(embedMessage, "leaving_message_active"),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	});
}
