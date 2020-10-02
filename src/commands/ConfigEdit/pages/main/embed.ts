import { Message, MessageEmbed } from "discord.js";

import { COLORS } from "../../../../misc/constants";

export function getMainEmbed(message: Message): MessageEmbed {
	return new MessageEmbed()
		.setAuthor("Configuration Editor - Main page", message.guild?.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.purple)
		.setTitle("React with any of the below emojis to edit the configuration.")
		.addField("❗ Prefix", "Change prefix", true)
		.addField("📝 Votes channel", "Change votes channel", true)
		.addField("📑 Logs active", "Toggle logs", true)
		.addField("📃 Logs channel", "Change logs channel", true)
		.addField("🔨 Mod logs active", "Toggle mod logs", true)
		.addField("⚒ Mod logs channel", "Change mod logs channel", true)
		.addField("📥 Joining message active", "Toggle joining message", true)
		.addField("📜 Joining message channel", "Change joining message channel", true)
		.addField("🖊️ Joining message", "Change joining message", true)
		.addField("⚜️ Joining role active", "Toggle joining role", true)
		.addField("💠 Joining role", "Change joining role", true)
		.addField("📤 Leaving message active", "Toggle leaving message", true)
		.addField("📄 Leaving message channel", "Change leaving message channel", true)
		.addField("🖋️ Leaving message", "Change leaving message", true)
		.addField("🤐 Mute role", "Change mute role", true)
		.addField("\u200b", "\u200b")
		.addField("✅ Finish", "Delete this embed", true);
}
