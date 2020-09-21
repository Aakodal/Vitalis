import { Message, MessageEmbed, User } from "discord.js";

import { db, Infraction } from "../../../lib/database";
import { writeInfractions } from "./writeInfractions";

export async function getList(message: Message, user: User, embed: MessageEmbed, type?: string): Promise<void> {
	const infractions: Infraction[] =
		type !== "infraction"
			? await db.from("infractions").where({ server_id: message.guild?.id, discord_id: user.id, type })
			: await db.from("infractions").where({ server_id: message.guild?.id, discord_id: user.id });

	const infractionsNumber = infractions.length;

	embed.setAuthor(
		`${infractionsNumber} Infraction(s) - ${user.tag}`,
		message.guild?.iconURL({ dynamic: true }) as string,
	);

	if (!infractionsNumber) {
		embed.setTitle(`No ${type} found.`);
		await message.channel.send(embed);
		return;
	}

	embed.setTitle(`Last 10 ${type}s`);

	const sortedInfractions = infractions.sort((a, b) => b.id - a.id);

	writeInfractions(sortedInfractions, embed);

	await message.channel.send(embed);
}
