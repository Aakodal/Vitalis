import { Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";

export async function getModLogsActiveEmbed(message: Message): Promise<MessageEmbed> {
	const active = await getValueFromDB<number>("servers", "mod_logs_active", { server_id: message.guild?.id });
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Mod logs active", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setDescription(`Mod logs active? ${Boolean(active)}`)
		.addField("🔄 Toggle", "Toggle the actual value", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
