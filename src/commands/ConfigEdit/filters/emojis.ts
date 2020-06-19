import { MessageReaction, User } from "discord.js";
import { EmbedMessage } from "../index";

export function getEmojiFilter(embedMessage: EmbedMessage): (reaction: MessageReaction, user: User) => boolean {
	const { message, author } = embedMessage;
	return (reaction: MessageReaction, user: User): boolean => reaction.message.id === message.id
		&& user === author
		&& !user.bot
		&& embedMessage.reactions.indexOf(reaction.emoji.name) >= 0;
}
