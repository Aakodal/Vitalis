import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchMember } from "../../functions/fetchMember";

export default class UserInfo extends Command {
	constructor() {
		super({
			name: "userinfo",
			description: "Get user's informations",
			category: "Misc",
			usage: (prefix) => `${prefix}userinfo [user mention|user id]`,
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		if (!message.guild || !message.member) {
			return;
		}

		const memberSnowflake = getUserIdFromString(args[0]);
		const memberArg = await fetchMember(message.guild, memberSnowflake as string);

		const member = memberArg || message.member;
		const { user } = member;

		const embed = new MessageEmbed()
			.setAuthor(user.tag)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setColor(member.displayHexColor)
			.setFooter(`Asked by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		embed.addField("Mention", user.toString(), true);

		embed.addField("Bot", user.bot, true);

		embed.addField("Created at", user.createdAt.toUTCString(), true);

		embed.addField("Joined at", member.joinedAt?.toUTCString(), true);

		const rolesArray = member.roles.cache.array().sort((a, b) => b.position - a.position);
		rolesArray.pop();
		const rolesString = rolesArray.length !== 0
			? rolesArray.join(" ")
			: "No role";
		embed.addField("Roles", rolesString);

		await message.channel.send(embed);
	}
}
