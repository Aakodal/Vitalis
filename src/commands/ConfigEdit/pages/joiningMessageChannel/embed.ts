import { Guild, Message, MessageEmbed } from "discord.js";
import { COLORS } from "../../../../lib/constants";
import { getValueFromDB } from "../../../../functions/getValueFromDB";
import { fetchGuildChannel } from "../../functions/fetchGuildChannel";

export async function getJoiningMessageChannelEmbed(message: Message): Promise<MessageEmbed> {
	const channelId = await getValueFromDB<string>(
		"servers",
		"joining_message_channel",
		{ server_id: message.guild?.id },
	);
	const channel = fetchGuildChannel(message.guild as Guild, channelId) || "<no channel defined>";
	return new MessageEmbed()
		.setAuthor(
			"Configuration Editor - Joining message channel",
			message.guild?.iconURL({ dynamic: true }) as string,
		)
		.setColor(COLORS.purple)
		.setDescription(`Current channel: ${channel}`)
		.addField("✏ Edit", "Edit the channel (mention or id)", true)
		.addField("🚪 Return", "Return to the main menu", true);
}
