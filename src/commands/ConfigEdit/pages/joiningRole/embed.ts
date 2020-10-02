import { Guild, Message, MessageEmbed } from "discord.js";

import { COLORS } from "../../../../misc/constants";
import { getValueFromDB } from "../../../../misc/database";
import { fetchRole } from "../../functions/fetchRole";

export async function getJoiningRoleEmbed(message: Message): Promise<MessageEmbed> {
	const roleId = await getValueFromDB<string>("servers", "joining_role_id", { server_id: message.guild?.id });
	const role = fetchRole(message.guild as Guild, roleId) || "<no role defined>";
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Joining role", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setDescription(`Current role: ${role}`)
		.addField("✏ Edit", "Edit the role (mention or id)", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
