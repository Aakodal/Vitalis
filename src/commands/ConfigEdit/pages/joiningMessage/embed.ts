import { Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";

export async function getJoiningMessageEmbed(message: Message): Promise<MessageEmbed> {
	const text = await getValueFromDB<string>("servers", "joining_message_text", { server_id: message.guild?.id });
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Joining message", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setDescription(`Current message:\n${text}`)
		.addField("✏ Edit", "Edit the message", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
