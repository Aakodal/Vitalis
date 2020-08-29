/* eslint-disable multiline-ternary */
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";

const boostObjective = ["/2", "/15", "/30", ""];

export default class ServerInfo extends Command {
	constructor(client: Client) {
		super({
			name: "serverinfo",
			description: "Get server's informations",
			category: "Misc",
		}, client);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const { guild } = message;

		if (!guild) {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor(guild.name)
			.setThumbnail(guild.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.gold)
			.setFooter(`Asked by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		embed.addField("Created at", guild.createdAt.toUTCString(), true);

		if (guild.description) {
			embed.addField("Description", guild.description, true);
		}

		const members = await guild.members.fetch();
		const memberCount = members.filter((member) => !member.user.bot).size;
		const botCount = members.filter((member) => member.user.bot).size;
		const membersText = `${guild.memberCount} total member(s) with ${memberCount} human(s) and ${botCount} bot(s)`;
		embed.addField("Member count", membersText, true);

		embed.addField("Roles", `${guild.roles.cache.size - 1} role(s)`, true);

		embed.addField("Custom emojis", `${guild.emojis.cache.size} custom emoji(s)`, true);

		const infos = `${guild.partnered ? "✅" : "❌"} Partner
		${guild.verified ? "✅" : "❌"} Verified`;
		embed.addField("Infos", infos, true);

		embed.addField("Region", guild.region, true);

		const boostText = `Level ${guild.premiumTier}/3
		${guild.premiumSubscriptionCount || 0}${boostObjective[guild.premiumTier]} boost(s)`;
		embed.addField("Boost level", boostText, true);

		message.channel.send(embed);
	}
}
