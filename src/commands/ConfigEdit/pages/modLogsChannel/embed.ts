import { Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";
import { fetchGuildChannel } from "../../functions/fetchGuildChannel";

export async function getModLogsChannelEmbed(message: Message): Promise<MessageEmbed> {
	const channelId = await getValueFromDB<string>("servers", "mod_logs_channel", { server_id: message.guild.id });
	const channel = fetchGuildChannel(message.guild, channelId) || "<no channel defined>";
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Mod logs channel", message.guild.iconURL({ dynamic: true }))
		.setColor(COLORS.purple)
		.setDescription(`Current channel: ${channel}`)
		.addField("✏ Edit", "Edit the channel (mention or id)", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
