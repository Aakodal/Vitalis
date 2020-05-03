import { MessageEmbed } from "discord.js";
import { formatDate } from "../../../functions/formatDate";
import { Infraction } from "../index";

export function getInfractions(infractions: Infraction[], embed: MessageEmbed) {
	const lastInfractions = infractions.slice(0, 10);

	for (const infraction of lastInfractions) {
		const { id, moderator } = infraction;
		const type = infraction.type.toUpperCase();
		const created = formatDate(infraction.created);
		const reason = infraction.infraction || "No reason.";
		const duration = infraction.duration
			? ` for ${infraction.duration}`
			: "";

		embed.addField(`**[ID: ${id}] [${type}] ${created + duration} (by ${moderator})**`, reason);
	}
}
