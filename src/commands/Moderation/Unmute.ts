import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";
import { sendError } from "../../functions/sendError";
import { unsanction } from "../../functions/unsanction";
import { getMuteRole } from "../../functions/getMuteRole";
import { canSanction } from "../../functions/canSanction";
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";
import { fetchMember } from "../../functions/fetchMember";

export default class Unmute extends Command {
	constructor() {
		super({
			name: "unmute",
			description: "Unmute a member",
			usage: "unmute <member ID | member mention>",
			aliases: ["demute"],
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[0]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const memberSnowflake = getUserSnowflakeFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

		if (!member) return sendError("Member not found.", message.channel);

		if (member.partial) await member.fetch();

		const muteRole = await getMuteRole(message.guild);

		if (!await canSanction(member, message.member, message.channel, "unmute")) return;

		if (!member.roles.cache.get(muteRole.id)) return sendError("This member is not muted.", message.channel);

		const unmuteEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.light_green)
			.setTitle("Unmute")
			.setDescription(`${member.user} has been unmuted`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL())

		try {
			await unsanction(member.id, message.guild, "muted", true);
		} catch (error) {
			return sendError(`For some reason, this user couldn't have been unmuted;\n\n${error}`, message.channel);
		}

		await message.channel.send(unmuteEmbed);

		await log("modlog", unmuteEmbed);
	}
}
