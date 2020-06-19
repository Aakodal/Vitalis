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

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const packageJsonPath = await getPackageJsonPath();
		const packageJson = await import(packageJsonPath);
		const {
			author, version, description, homepage, dependencies, devDependencies,
		} = packageJson;
		const invite = "https://discord.com/api/oauth2/authorize?client_id=647787304550924300&permissions=8&scope=bot";

		const embed = new MessageEmbed()
			.setAuthor("Vitalis - Informations", client.user.displayAvatarURL({ dynamic: true }), homepage)
			.setColor(COLORS.gold)
			.addField("**Author**", author, true)
			.addField("**Version**", version, true)
			.addField("**Language**", `TypeScript ${devDependencies.typescript}`, true)
			.addField("**GitHub Repo**", `[Link](${homepage})`, true)
			.addField("**Library**", `[discord.js](https://discord.js.org/#/) ${dependencies["discord.js"]}`, true)
			.addField("**Invite link**", `[Click here!](${invite})`, true)
			.addField("**Description**", description)
			.setFooter(
				`Vitalis - ${author} | Apache 2.0 license. Asked by ${message.author.tag}`,
				message.author.displayAvatarURL({ dynamic: true }),
			);

		await message.channel.send(embed);
	}
}
