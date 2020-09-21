import { getValueFromDB } from "../../../functions/getValueFromDB";
import { pushValueInDB } from "../../../functions/pushValueInDB";
import { EmbedMessage } from "../index";
import { reactionsHandler } from "./reactionsHandler";

export async function toggleValue(source: EmbedMessage, column: string): Promise<void> {
	const { message, embed } = source;

	const value = await getValueFromDB<number>("servers", column, { server_id: message.guild?.id });

	await pushValueInDB<boolean>("servers", column, message.guild?.id as string, !value);

	await message.edit("", await embed(message));
	await reactionsHandler(source);
}
