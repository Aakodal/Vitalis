import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchUser } from "../../functions/fetchUser";
import { CommandError } from "../../exceptions/CommandError";
import { UserError } from "../../exceptions/UserError";
import { getList } from "./functions/getList";
import { getValueFromDB } from "../../functions/getValueFromDB";

export default class Infractions extends Command {
	constructor(client: Client) {
		super({
			name: "infractions",
			description: "See a member's infractions",
			category: "Moderation",
			usage: (prefix) => `${prefix}infractions <member ID | member mention> [warn|kick|mute|ban]`,
			aliases: ["sanctions"],
			permission: "VIEW_AUDIT_LOG",
		}, client);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[0]) {
			throw new CommandError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const userSnowflake = getUserIdFromString(args[0]);
		const user = await fetchUser(userSnowflake as string);

		if (!user) {
			throw new UserError();
		}

		const type = args[1]?.toLowerCase() || "infraction";

		const embed = new MessageEmbed()
			.setColor(COLORS.orange)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setFooter(`Asked by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp();

		await getList(message, user, embed, type);
	}
}
