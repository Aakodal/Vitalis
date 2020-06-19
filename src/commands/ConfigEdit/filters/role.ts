import { Message } from "discord.js";
import { EmbedMessage } from "../index";
import { getRoleIdFromString } from "../functions/getRoleIdFromString";
import { fetchRole } from "../functions/fetchRole";

export function getRoleFilter(embedMessage: EmbedMessage): (target: Message) => boolean {
	const { message } = embedMessage;

	return (target: Message): boolean => Boolean(fetchRole(message.guild, getRoleIdFromString(target.content)));
}
