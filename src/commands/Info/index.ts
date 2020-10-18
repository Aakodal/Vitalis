import { Message, MessageEmbed } from "discord.js";
import { promises as fs } from "fs";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { COLORS } from "../../misc/constants";
import { getPackageJsonPath } from "./functions/getPackageJsonPath";

export default class Info extends Command {
	constructor(client: Client) {
		super(
			{
				name: "info",
				description: "Get bot's informations",
				category: "Misc",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const packageJsonPath = await getPackageJsonPath();
		const packageJson = JSON.parse(await fs.readFile(packageJsonPath as string, "utf-8"));
		const { author, version, description, homepage, dependencies } = packageJson;
		const invite =
			"https://discord.com/api/oauth2/authorize?client_id=647787304550924300&permissions=2113797879&scope=bot";

		const embed = new MessageEmbed()
			.setAuthor("Vitalis - Informations", this.client.user?.displayAvatarURL({ dynamic: true }), homepage)
			.setColor(COLORS.gold)
			.addField("**Author**", author, true)
			.addField("**Version**", version, true)
			.addField("**Language**", `TypeScript ${dependencies.typescript}`, true)
			.addField("**GitHub Repo**", `[Link](${homepage})`, true)
			.addField("**Library**", `[discord.js](https://discord.js.org/#/) ${dependencies["discord.js"]}`, true)
			.addField("**Invite link**", `[Click here!](${invite})`, true)
			.addField("**Servers count**", this.client.guilds.cache.size, true)
			.addField("**Description**", description)
			.setFooter(
				`Vitalis - ${author} | AGPLv3 license. Asked by ${message.author.tag}`,
				message.author.displayAvatarURL({ dynamic: true }),
			);

		await message.channel.send(embed);
	}
}
