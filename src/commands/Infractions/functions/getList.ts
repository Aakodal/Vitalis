import { Message, MessageEmbed, User } from "discord.js";
import { db } from "../../../lib/database";
import { Infraction } from "../index";
import { getInfractions } from "./getInfractions";

export async function getList(message: Message, user: User, embed: MessageEmbed, type?: string) {
	const infractions: Infraction[] = type !== "infraction"
		? await db.from("infractions").where({ discord_id: user.id, type })
		: await db.from("infractions").where({ discord_id: user.id });

	const infractionsNumber = infractions.length;

	embed.setAuthor(`${infractionsNumber} Infraction(s) - ${user.tag}`, message.guild.iconURL());

	if (!infractionsNumber) {
		embed.setTitle(`No ${type} found.`);
		return message.channel.send(embed);
	}

	embed.setTitle(`Last 10 ${type}s`);

	const sortedInfractions = infractions.sort((a, b) => b.id - a.id);

	getInfractions(sortedInfractions, embed);

	message.channel.send(embed);
}
