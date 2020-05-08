import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { db } from "../../lib/database";
import { DatabaseError } from "../../exceptions/DatabaseError";
import { COLORS } from "../../lib/constants";

export default class DeleteInfraction extends Command {
	constructor() {
		super({
			name: "deleteinfraction",
			description: "Remove an infraction from database with its ID",
			category: "Moderation",
			usage: "deleteinfraction <infraction ID>",
			aliases: ["removeinfraction"],
			permission: "BAN_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);

		const id = Number(args[0]);
		const infractionQuery = db.from("infractions").where({ id });
		const infraction = (await infractionQuery)[0];

		if (!infraction) throw new DatabaseError(`Infraction ${id} does not exist in database.`);

		try {
			await infractionQuery.delete();
		} catch (error) {
			throw new DatabaseError(`Could not delete infraction ${id};\n\n${error.message}`);
		}

		const embed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.lightGreen)
			.setTitle(`Infraction ${id} deleted from database.`);

		await message.channel.send(embed);
	}
}
