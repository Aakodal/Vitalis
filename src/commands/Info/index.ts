import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { getPackageJsonPath } from "./functions/getPackageJsonPath";

export default class Info extends Command {
	constructor() {
		super({
			name: "info",
			description: "Get bot's informations",
			category: "Misc",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		const packageJsonPath = await getPackageJsonPath();
		const packageJson = await import(packageJsonPath);
		const {
			author, version, description, homepage, dependencies, devDependencies,
		} = packageJson;

		const embed = new MessageEmbed()
			.setAuthor("Vitalis - Informations", client.user.avatarURL(), homepage)
			.setColor(COLORS.gold)
			.addField("**Author**", author, true)
			.addField("**Version**", version, true)
			.addField("**Language**", `TypeScript ${devDependencies.typescript}`, true)
			.addField("**GitHub Repo**", `[Link](${homepage})`, true)
			.addField("**Library**", `[discord.js](https://discord.js.org/#/) ${dependencies["discord.js"]}`, true)
			.addField("**Description**", description)
			.setFooter(`Vitalis - ${author} | Apache 2.0 license. Asked by ${message.author.tag}`,
				message.author.avatarURL());

		message.channel.send(embed);
	}
}
