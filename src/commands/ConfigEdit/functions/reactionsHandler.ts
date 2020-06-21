import { EmbedMessage } from "../index";
import { getEmojiFilter } from "../filters/emojis";
import { collectReaction } from "../../../functions/collectReaction";

export async function reactionsHandler(embedMessage: EmbedMessage): Promise<void> {
	const { message, reactionsEffects, author } = embedMessage;
	const effects = reactionsEffects.bind(embedMessage)();
	const emojiFilter = getEmojiFilter(embedMessage);

	const reaction = await collectReaction(message, emojiFilter);
	if (!reaction) {
		return;
	}

	if (!effects[reaction.emoji.name]) {
		return;
	}
	await reaction.users.remove(author);
	effects[reaction.emoji.name]();
}
