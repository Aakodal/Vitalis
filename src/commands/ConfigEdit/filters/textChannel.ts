import { Message } from "discord.js";
import { fetchGuildChannel } from "../functions/fetchGuildChannel";
import { getChannelIdFromString } from "../functions/getChannelIdFromString";
import { EmbedMessage } from "../index";

export function getTextChannelFilter(embedMessage: EmbedMessage): (target: Message) => boolean {
	const { message } = embedMessage;

	return (target: Message): boolean => {
		const channel = fetchGuildChannel(message.guild, getChannelIdFromString(target.content));
		return channel && channel.type === "text";
	};
}
