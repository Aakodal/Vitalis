import { Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";

export async function getPrefixEmbed(message: Message): Promise<MessageEmbed> {
	const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Prefix", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setDescription(`Current prefix: ${prefix}`)
		.addField("✏ Edit", "Edit the prefix", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
