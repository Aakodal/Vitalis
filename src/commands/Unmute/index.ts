import { Message, MessageEmbed } from "discord.js";

import { Client } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";
import { canSanction } from "../../functions/canSanction";
import { fetchMember } from "../../functions/fetchMember";
import { getMuteRole } from "../../functions/getMuteRole";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { getValueFromDB } from "../../functions/getValueFromDB";
import { log } from "../../functions/log";
import { unsanction } from "../../functions/unsanction";
import { COLORS } from "../../lib/constants";

export default class Unmute extends Command {
	constructor(client: Client) {
		super(
			{
				name: "unmute",
				description: "Unmute a member",
				category: "Moderation",
				usage: (prefix) => `${prefix}unmute <member ID | member mention>`,
				aliases: ["demute"],
				permission: "MUTE_MEMBERS",
			},
			client,
		);
	}

	async run(message: Message, args: string[]): Promise<void> {
		if (!message.guild || !message.member) {
			return;
		}

		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild?.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage?.(prefix)}`);
		}

		const memberSnowflake = getUserIdFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake as string);

		if (!member) {
			throw new MemberError();
		}

		const muteRole = await getMuteRole(message.guild);

		if (!(await canSanction(member, message.member, "unmute"))) {
			return;
		}

		if (!member.roles.cache.get(muteRole.id)) {
			throw new SanctionError("This user is not muted.");
		}

		const unmuteEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild?.iconURL({ dynamic: true }) as string)
			.setColor(COLORS.lightGreen)
			.setTitle("Unmute")
			.setDescription(`${member.user} has been unmuted.`)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		try {
			await unsanction(member.id, message.guild, "muted", true);
		} catch (error) {
			throw new SanctionError(`For some reason, this user couldn't have been unmuted; ${error.message}`);
		}

		await log("mod_log", unmuteEmbed, message.guild);

		await message.channel.send(unmuteEmbed);
	}
}
