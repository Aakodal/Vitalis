import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../classes/Command";
import { Client } from "../../classes/Client";
import { COLORS } from "../../lib/constants";
import { db } from "../../lib/database";
import { log } from "../../functions/log";
import { getSanctionValues } from "../../functions/getSanctionValues";
import { verifUserInDB } from "../../functions/verifUserInDB";
import { sendError } from "../../functions/sendError";
import { unsanction } from "../../functions/unsanction";
import { getMuteRole } from "../../functions/getMuteRole";
import { canSanction } from "../../functions/canSanction";
import { longTimeout } from "../../functions/longTimeout";
import { getUserSnowflakeFromString } from "../../functions/getUserSnowflakeFromString";
import { fetchMember } from "../../functions/fetchMember";

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
		if (!args[1]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

		const memberSnowflake = getUserSnowflakeFromString(args[0]);
		const member = await fetchMember(message.guild, memberSnowflake);

		if (!member) return sendError("Member not found.", message.channel);

		if (member.partial) await member.fetch();

		const muteRole = await getMuteRole(message.guild);

		if (member.user.bot) return sendError("You can't mute a bot.", message.channel);

		if (!await canSanction(member, message.member, message.channel, "mute")) return;

		if (member.roles.cache.get(muteRole.id)) return sendError("This member is already muted.", message.channel);

		const [durationString, duration, reason, embedDescription, DMDescription] = getSanctionValues(args, "muted", member.user, message.guild);
		const durationNumber = Number(duration);

		if (durationNumber && !args[2]) return sendError(`Wrong command usage.\n\n${this.informations.usage}`, message.channel);

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
			return sendError(`For some reason, this member couldn't have been muted;\n\n${error}`, message.channel);
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
