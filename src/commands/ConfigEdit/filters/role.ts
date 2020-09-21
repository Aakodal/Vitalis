import { Guild, Message } from "discord.js";

import { fetchRole } from "../functions/fetchRole";
import { getRoleIdFromString } from "../functions/getRoleIdFromString";
import { EmbedMessage } from "../index";

export function getRoleFilter(embedMessage: EmbedMessage): (target: Message) => boolean {
	const { message } = embedMessage;

	return (target: Message): boolean =>
		Boolean(fetchRole(message.guild as Guild, getRoleIdFromString(target.content) as string));
}
