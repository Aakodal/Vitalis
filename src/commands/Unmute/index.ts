import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { log } from "../../functions/log";
import { unsanction } from "../../functions/unsanction";
import { getMuteRole } from "../../functions/getMuteRole";
import { canSanction } from "../../functions/canSanction";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchMember } from "../../functions/fetchMember";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";
import { getValueFromDB } from "../../functions/getValueFromDB";

export default class Unmute extends Command {
	constructor() {
		super({
			name: "unmute",
			description: "Unmute a member",
			category: "Moderation",
			usage: (prefix) => `${prefix}unmute <member ID | member mention>`,
			aliases: ["demute"],
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild.id });

		if (!args[0]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage(prefix)}`);
		}

		const memberSnowflake = getUserIdFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

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
			.setAuthor("Moderation", message.guild.iconURL({ dynamic: true }))
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

		await message.channel.send(unmuteEmbed);

		await log("mod_log", unmuteEmbed, message.guild);
	}
}
