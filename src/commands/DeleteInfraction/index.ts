import { Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { DatabaseError } from "../../exceptions/DatabaseError";
import { COLORS } from "../../misc/constants";
import { db, getValueFromDB } from "../../misc/database";

export default class DeleteInfraction extends Command {
	constructor(client: Client) {
		super(
			{
				name: "deleteinfraction",
				description: "Remove an infraction from database with its ID",
				category: "Moderation",
				usage: (prefix) => `${prefix}deleteinfraction <infraction ID>`,
				aliases: ["removeinfraction"],
				permission: "BAN_MEMBERS",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const id = Number(args[0]);
		const infractionQuery = db.from("infractions").where({ server_id: message.guild?.id, id });
		const infraction = (await infractionQuery)[0];

		if (!infraction) {
			throw new DatabaseError(`Infraction ${id} does not exist in database or in this server.`);
		}

		try {
			await infractionQuery.delete();
		} catch (error) {
			throw new DatabaseError(`Could not delete infraction ${id};\n\n${error.message}`);
		}

		const embed = new MessageEmbed()
			.setAuthor("Moderation", message.guild?.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTitle(`Infraction ${id} deleted from database.`);

		await message.channel.send(embed);
	}
}
