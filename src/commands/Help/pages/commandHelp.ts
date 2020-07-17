import { Message, MessageEmbed, PermissionString } from "discord.js";
import { CommandError } from "../../../exceptions/CommandError";
import * as config from "../../../config.json";
import { PermissionError } from "../../../exceptions/PermissionError";
import { Client } from "../../../classes/Client";
import { COLORS } from "../../../lib/constants";

export async function commandHelp(
	message: Message,
	args: string[],
	client: Client,
	prefix: string,
): Promise<void> {
	const command = client.commands.get(args[0].toLowerCase());
	if (!command) {
		throw new CommandError(`Command ${args[0]} not found.`);
	}

	const {
		name, description, usage, aliases, permission, category,
	} = command.informations;

	if (permission === "BOT_OWNER" && message.author.id !== config.botOwner) {
		throw new PermissionError("You do not have permission to see this command.");
	}

	if (permission && !message.member?.hasPermission(permission as PermissionString)) {
		throw new PermissionError("You do not have permission to see this command.");
	}

	const commandEmbed = new MessageEmbed()
		.setColor(COLORS.lightGreen)
		.setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) as string)
		.setFooter(`Asked by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
		.setAuthor("Help - Command informations")
		.setTitle(`**${prefix}${name} ─ ${category}**`);

	if (description) {
		commandEmbed.addField("**Description**", description);
	}

	const usageString = usage?.(prefix) || prefix + name;
	commandEmbed.addField("**Usage**", usageString);

	if (aliases?.length as number > 0) {
		commandEmbed.addField("**Aliases**", aliases?.join(", "));
	}

	if (permission) {
		commandEmbed.addField("**Permission**", permission);
	}

	await message.channel.send(commandEmbed);
}
