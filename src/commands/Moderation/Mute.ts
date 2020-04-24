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
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";
import { fetchMember } from "../../functions/fetchMember";
import { ArgumentError } from "../../exceptions/ArgumentError";
import { MemberError } from "../../exceptions/MemberError";
import { SanctionError } from "../../exceptions/SanctionError";
import { UsageError } from "../../exceptions/UsageError";

export default class Mute extends Command {
	constructor() {
		super({
			name: "mute",
			description: "Mute a member with a specified reason",
			usage: "mute <member ID | member mention> [duration] <reason>",
			permission: "MUTE_MEMBERS",
		});
	}

	async run(message: Message, args: string[], client: Client) {
		if (!args[1]) throw new ArgumentError(`Argument missing. Usage: ${this.informations.usage}`);

		const memberSnowflake = getUserSnowflakeFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

		if (!member) throw new MemberError();

		if (member.partial) await member.fetch();

		const muteRole = await getMuteRole(message.guild);

		if (member.user.bot) throw new SanctionError("You can't mute a bot.");

		if (!await canSanction(member, message.member, message.channel, "mute")) return;

		if (member.roles.cache.get(muteRole.id)) throw new SanctionError("This member is already muted.");

		const [durationString, duration, reason, embedDescription, DMDescription] = getSanctionValues(args, "muted", member.user, message.guild);
		const durationNumber = Number(duration);

		if (durationNumber && !args[2]) throw new UsageError(`Wrong command usage. Usage: ${this.informations.usage}`);

		const muteEmbed = new MessageEmbed()
			.setAuthor("Moderation", message.guild.iconURL())
			.setColor(COLORS.light_green)
			.setTitle("Mute")
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter(`Moderator: ${message.author.tag}`, message.author.avatarURL());

		try {
			await member.roles.add(muteRole);
		} catch (error) {
			throw new SanctionError(`For some reason, this member couldn't have been muted; ${error.message}`);
		}

		await message.channel.send(muteEmbed);

		await log("modlog", muteEmbed);

		await member.user.send(muteEmbed.setDescription(DMDescription));

		const memberID = member.user.id;

		const created = Date.now();

		const expiration = duration
			? created + durationNumber
			: null;

		await db
			.insert({
				discord_id: memberID,
				infraction: reason,
				type: "mute",
				created,
				expiration,
				duration: durationString,
				moderator: message.author.id,
			})
			.into("infractions");

		await verifUserInDB(memberID);

		await db.update({
			pseudo: member.user.tag,
			actual_sanction: "muted",
			created,
			expiration,
		}).into("users").where({ discord_id: memberID });

		if (!duration) return;

		longTimeout(async () => {
			await unsanction(memberID, message.guild, "muted", false);
		}, expiration - created);
	}
}
