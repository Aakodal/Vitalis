import { Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";

export async function getLeavingMessageActiveEmbed(message: Message): Promise<MessageEmbed> {
	const active = await getValueFromDB<number>(
		"servers",
		"leaving_message_active",
		{ server_id: message.guild?.id },
	);
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Leaving message active", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setDescription(`Leaving message active? ${Boolean(active)}`)
		.addField("🔄 Toggle", "Toggle the actual value", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
