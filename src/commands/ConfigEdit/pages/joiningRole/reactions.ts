import { changePage } from "../../functions/changePage";
import { editValue } from "../../functions/editValue";
import { EmbedMessage, getMainEmbedMessage, ReactionsEffects } from "../../index";
import { getRoleFilter } from "../../filters/role";

export function getJoiningRoleReactionsEffects(embedMessage: EmbedMessage): ReactionsEffects {
	const { message, author } = embedMessage;

	return ({
		"✏": async (): Promise<void> => editValue(embedMessage, getRoleFilter(embedMessage), "joining_role_id"),
		"🚪": async (): Promise<void> => changePage(getMainEmbedMessage(message, author)),
	});
}
