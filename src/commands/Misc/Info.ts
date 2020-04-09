import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";

export default class Info extends Command {
	constructor() {
		super({
			name: "info",
			description: "Get bot's informations",
		});
	}

	run(message: Message, args: string[], client: Client) {
		const infos = {
			author: process.env.npm_package_author,
			version: process.env.npm_package_version,
			description: process.env.npm_package_description,
			github: process.env.npm_package_repository_url,
			dependencies: {
				"discord.js": process.env.npm_package_dependencies_discord_js,
				typescript: process.env.npm_package_devDependencies_typescript,
			},
		};

		const embed = new MessageEmbed()
			.setAuthor("Vitalis - Informations", client.user.avatarURL(), infos.github)
			.setColor(COLORS.gold)
			.addField("**Author**", infos.author, true)
			.addField("**Version**", infos.version, true)
			.addField("**Language**", "TypeScript 3.8.3", true)
			.addField("**Library**", `[discord.js](https://discord.js.org/#/) ${infos.dependencies["discord.js"]}`, true)
			.addField("**Description**", infos.description)
			.setFooter(`Vitalis - ${infos.author} | Apache 2.0 license. Asked by ${message.author.tag}`,
				message.author.avatarURL());

		message.channel.send(embed);
	}
}
