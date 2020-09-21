import { changePage } from "../../functions/changePage";
import { toggleValue } from "../../functions/toggleValue";
import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";

export function getLogsActiveReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	return {
		"🔄": async (): Promise<void> => toggleValue(embedMessage, "logs_active"),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	};
}
