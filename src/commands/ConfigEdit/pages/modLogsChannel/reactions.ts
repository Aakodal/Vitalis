import { getTextChannelFilter } from "../../filters/textChannel";
import { changePage } from "../../functions/changePage";
import { editValue } from "../../functions/editValue";
import { getChannelIdFromString } from "../../functions/getChannelIdFromString";
import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";

export function getModLogsChannelReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	return {
		"✏": async (): Promise<void> =>
			editValue(embedMessage, getTextChannelFilter(embedMessage), "mod_logs_channel", getChannelIdFromString),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	};
}
