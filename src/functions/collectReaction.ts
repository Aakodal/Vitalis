import {
	AwaitReactionsOptions, Message, MessageReaction, User,
} from "discord.js";

export async function collectReaction(
	message: Message,
	filter: (reaction: MessageReaction, user: User) => boolean,
	options: AwaitReactionsOptions = { max: 1 },
): Promise<MessageReaction | void> {
	const collected = await message.awaitReactions(filter, options);
	const reaction = collected.first();

	if (!reaction) {
		return;
	}
	if (reaction.partial) {
		await reaction.fetch();
	}
	if (reaction.message.partial) {
		await reaction.message.fetch();
	}

	return reaction;
}
