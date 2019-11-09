import { Message, RichEmbed } from "discord.js";
import { Command } from "../lib/Command";
import { Client } from "../lib/Client";
import { sendError } from "../lib/functions";
import { COLORS } from "../lib/constants";
import { db } from "../lib/database";

export default class Warn extends Command {
	constructor() {
		super({
			name: "warn",
			description: "Warn a member with a specified reason",
			usage: "warn <member mention> <reason>",
			category: "Moderation",
			permission: "KICK_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.usage}`, message.channel);

		const member = message.mentions.members.first();
		const reason = args.slice(1).join(" ");

		if (!member) return sendError("Please mention the member. Note that they must be on the server.", message.channel);
		if (member.user.bot) return sendError("You can't warn a bot.", message.channel);
		if (member === message.member) return sendError("You can't warn yourself.", message.channel);

		const clientMember = message.guild.member(client.user);

		if (member.highestRole.comparePositionTo(clientMember.highestRole) >= 0
            || member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return sendError(
				"You can't warn someone who is superior or equal to you or to me.",
				message.channel,
			);
		}

		const warnEmbed = new RichEmbed()
			.setAuthor("Moderation", message.guild.iconURL)
			.setColor(COLORS.light_green)
			.setTitle("Warning")
			.setDescription(`${member.user} has been warned for the following reason:\n\n${reason}`)
			.setTimestamp();

		message.channel.send(warnEmbed);

		// TODO: add mod logging here (adding the moderator)

		try {
			member.user.send(warnEmbed.setDescription(`You have been warned for the following reasion:\n\n${reason}`));
		} catch (error) {}

		const memberID = member.user.id;

		await db
			.insert({
				discord_id: memberID,
				infraction: reason,
				type: "warn",
				created: Date.now(),
				moderator: message.author.tag,
			})
			.into("infractions");

		const userInDB = await db
			.from("users")
			.where({ discord_id: memberID });

		if (!userInDB[0]) {
			await db
				.insert({ discord_id: memberID })
				.into("users");
		}

		await db
			.update({ last_warn: Date.now() })
			.into("users")
			.where({ discord_id: memberID });
	}
}
