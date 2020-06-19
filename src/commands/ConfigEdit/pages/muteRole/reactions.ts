import { changePage } from "../../functions/changePage";
import { editValue } from "../../functions/editValue";
import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";
import { getRoleFilter } from "../../filters/role";

export function getMuteRoleReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	return ({
		"✏": async (): Promise<void> => editValue(embedMessage, getRoleFilter(embedMessage), "mute_role_id"),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	});
}
