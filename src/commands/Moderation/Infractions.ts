import {
	Message, MessageEmbed, Snowflake, User,
} from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { db } from "../../lib/database";
import { COLORS } from "../../lib/constants";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { formatDate } from "../../functions/formatDate";
import { fetchUser } from "../../functions/fetchUser";
import { CommandError } from "../../exceptions/CommandError";
import { UserError } from "../../exceptions/UserError";

interface Infraction {
	id: number,
	discord_id: Snowflake,
	infraction: string,
	type: "warn" | "mute" | "kick" | "ban",
	created: number,
	expiration: number,
	duration: string,
	moderator: string,
}

export default class Infractions extends Command {
	constructor() {
		super({
			name: "infractions",
			description: "See a member's infractions",
			usage: "infractions <member ID | member mention> [warn|kick|mute|ban]",
			aliases: ["sanctions"],
			permission: "VIEW_AUDIT_LOG",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) throw new CommandError(`Argument missing. Usage: ${this.informations.usage}`);

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await fetchUser(userSnowflake);

		if (!user) throw new UserError();

		const type = args[1]?.toLowerCase() || "infraction";

		const embed = new MessageEmbed()
			.setColor(COLORS.orange)
			.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL())
			.setTimestamp();

		await Infractions.getList(message, user, embed, type);
	}

	private static async getList(message: Message, user: User, embed: MessageEmbed, type?: string) {
		const infractions: Infraction[] = type
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

		Infractions.getInfractions(sortedInfractions, embed);

		message.channel.send(embed);
	}

	private static getInfractions(infractions: Infraction[], embed: MessageEmbed) {
		const lastInfractions = infractions.slice(0, 10);

		for (const infraction of lastInfractions) {
			const type = infraction.type.toUpperCase;
			const created = formatDate(infraction.created);
			const { moderator } = infraction;
			const reason = infraction.infraction || "No reason.";
			const duration = infraction.duration
				? ` for ${infraction.duration}`
				: "";

			embed.addField(`**${type} ${created + duration} (by ${moderator})**`, reason);
		}
	}
}
