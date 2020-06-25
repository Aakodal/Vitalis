import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { getSanctionValues } from "../../functions/getSanctionValues";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { unsanction } from "../../functions/unsanction";
import { getMuteRole } from "../../functions/getMuteRole";
import { canSanction } from "../../functions/canSanction";
import { longTimeout } from "../../functions/longTimeout";
import { getUserIdFromString } from "../../functions/getUserIdFromString";
import { fetchMember } from "../../functions/fetchMember";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";
import { UsageError } from "../../exceptions/UsageError";
import { getValueFromDB } from "../../functions/getValueFromDB";

export default class Mute extends Command {
	constructor() {
		super({
			name: "mute",
			description: "Mute a member with a specified reason",
			category: "Moderation",
			usage: (prefix) => `${prefix}mute <member ID | member mention> [duration] <reason>`,
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client): Promise<void> {
		const prefix = await getValueFromDB<string>("servers", "prefix", { server_id: message.guild.id });

		if (!args[1]) {
			throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage(prefix)}`);
		}

		const memberSnowflake = getUserIdFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

		if (!member) {
			throw new MemberError();
		}

		const muteRole = await getMuteRole(message.guild);

		if (member.user.bot) {
			throw new SanctionError("You can't mute a bot.");
		}

		if (!(await canSanction(member, message.member, "mute"))) {
			return;
		}

		if (member.roles.cache.get(muteRole.id)) {
			throw new SanctionError("This member is already muted.");
		}

		const [durationString, duration, reason, embedDescription, dmDescription] = getSanctionValues(
			args,
			"muted",
			member.user,
			message.guild,
		);
		const durationNumber = Number(duration);

		if (durationNumber && !args[2]) {
			throw new UsageError(`Wrong command usage. Usage: ${this.informations.usage(prefix)}`);
		}

		const muteEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild..iconURL({ dynamic: true }))
			.setColor(COLORS.lightGreen)
			.setTitle("Mute")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

		const userEmbed = new MessageEmbed(muteEmbed).setDescription(dmDescription);

		try {
			await member.roles.add(muteRole);
		} catch (error) {
			throw new SanctionError(`For some reason, this member couldn't have been muted; ${error.message}`);
		}

		await message.channel.send(muteEmbed);

		await log("mod_log", muteEmbed, message.guild);

		await member.user.send(userEmbed);

		const memberID = member.user.id;

		const created = Date.now();

		const expiration = duration
			? created + durationNumber
			: null;

		await db
			.insert({
				server_id: message.guild.id,
				discord_id: memberID,
				infraction: reason,
				type: "mute",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(memberID, message.guild);

		await db
			.update({
				pseudo: member.user.tag,
				actual_sanction: "muted",
				created,
				expiration,
			})
			.into("users")
			.where({ server_id: message.guild.id, discord_id: memberID });

		if (!duration) {
			return;
		}

		longTimeout(async () => {
			await unsanction(memberID, message.guild, "muted", false);
		}, expiration - created);
	}
}
