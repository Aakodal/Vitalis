import { Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";

export async function getJoiningRoleActiveEmbed(message: Message): Promise<MessageEmbed> {
	const active = await getValueFromDB<number>("servers", "joining_role_active", { server_id: message.guild?.id });
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Joining role active", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setDescription(`Joining role active? ${Boolean(active)}`)
		.addField("🔄 Toggle", "Toggle the actual value", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
