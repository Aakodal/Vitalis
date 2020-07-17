import { Guild, Message } from "discord.js";
import { fetchGuildChannel } from "../functions/fetchGuildChannel";
import { getChannelIdFromString } from "../functions/getChannelIdFromString";
import { EmbedMessage } from "../index";

export function getTextChannelFilter(embedMessage: EmbedMessage): (target: Message) => boolean {
	const { message } = embedMessage;

	return (target: Message): boolean => {
		const channel = fetchGuildChannel(message.guild as Guild, getChannelIdFromString(target.content) as string);
		return Boolean(channel) && channel?.type === "text";
	};
}
