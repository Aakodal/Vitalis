import * as dateFns from "date-fns";
import { GuildMember, Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { db } from "../../lib/database";
import { COLORS } from "../../lib/constants";
import { sendError } from "../../functions/sendError";
import { Infraction } from "../../typings";
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";

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
		if (!args[0]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const memberSnowflake = getUserSnowflakeFromString(args[0]);
		const member = await message.guild.members.fetch(memberSnowflake) as GuildMember;

		if (!member) return sendError("Please mention the member. Note that they must be on the server.", message.channel);

		if (member.partial) await member.fetch();

		const type = args[1]?.toLowerCase();

		const embed = new MessageEmbed()
			.setColor(COLORS.orange)
			.setFooter(`Asked by ${message.author.tag}`, message.author.avatarURL())
			.setTimestamp();

		await Infractions.getList(message, member, embed, type);
	}

	private static async getList(message: Message, member: GuildMember, embed: MessageEmbed, type?: string) {
		const infractions: Infraction[] = type
			? await db.from("infractions").where({ discord_id: member.id, type })
			: await db.from("infractions").where({ discord_id: member.id });

		const infractionsType = type || "infraction";
		const infractionsNumber = infractions.length;

		embed.setAuthor(`${infractionsNumber} Infraction(s) - ${member.user.tag}`, message.guild.iconURL());

		if (!infractionsNumber) {
			embed.setTitle(`No ${infractionsType} found.`);
			return message.channel.send(embed);
		}

		embed.setTitle(`Last 10 ${infractionsType}s`);

		const sortedInfractions = infractions.sort((a, b) => b.id - a.id);

		Infractions.getInfractions(sortedInfractions, embed);

		message.channel.send(embed);
	}

	private static getInfractions(infractions: Infraction[], embed: MessageEmbed) {
		const lastInfractions = infractions.slice(0, 10);

		for (const infraction of lastInfractions) {
			const created = dateFns.format(infraction.created, "dd/MM/yyyy 'at' HH:mm");
			const { moderator } = infraction;
			const reason = infraction.infraction || "No reason.";
			const duration = infraction.duration
				? ` for ${infraction.duration}`
				: "";

			embed.addField(`**${created + duration} - by ${moderator}**`, reason);
		}
	}
}
