import {
	Message, MessageEmbed, Snowflake,
} from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchUser } from "../../functions/fetchUser";
import { CommandError } from "../../exceptions/CommandError";
import { UserError } from "../../exceptions/UserError";
import { getList } from "./functions/getList";

export interface Infraction {
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
			category: "Moderation",
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

		await getList(message, user, embed, type);
	}
}
