import { Guild, MessageEmbed, Snowflake } from "discord.js";
import { db } from "../lib/database";
import { COLORS } from "../lib/constants";
import { log } from "./log";
import { verifUserInDB } from "./verifUserInDB";
import { getMuteRole } from "./getMuteRole";
import { longTimeout } from "./longTimeout";

export async function unsanction(id: Snowflake, server: Guild, sanction: string, forced = false) {
	await verifUserInDB(id);
	const user = (await db.from("users").where({ discord_id: id, actual_sanction: sanction }))[0];

	if (!user) return;

	const { expiration } = user;
	const now = Date.now();

	if (expiration
		&& now < expiration
		&& !forced
	) {
		return longTimeout(() => {
			unsanction(id, server, sanction);
		}, expiration - now);
	}

	const embed = new MessageEmbed()
		.setAuthor("Moderation", server.iconURL())
		.setColor(COLORS.light_green)
		.setDescription(`You have been unmuted from ${server.name}`)
		.setTimestamp();

	const autoEmbed = new MessageEmbed()
		.setAuthor("Moderation", server.iconURL())
		.setColor(COLORS.gold)
		.setDescription(`[AUTO] ${user.pseudo} has been un${sanction} (sanction timeout)`)
		.setTimestamp();

	if (sanction === "muted") {
		const member = server.members.cache.get(id);
		const muteRole = await getMuteRole(server);

		if (!member
			|| !muteRole) return;

		if (member.partial) await member.fetch();

		if (member.roles.cache.get(muteRole.id)) await member.roles.remove(muteRole);
		await db.update({
			actual_sanction: null,
			created: null,
			expiration: null,
		}).into("users").where({ discord_id: id });

		await member.send(embed.setTitle("Unmute"));

		if (!forced) await log("modlog", autoEmbed);

		return;
	}
	// else
	const bans = await server.fetchBans();
	if (!bans.get(id)) return;

	await server.members.unban(id, "[AUTO] Sanction finished.");
	await db.update({
		actual_sanction: null,
		created: null,
		expiration: null,
	}).into("users").where({ discord_id: id });

	if (!forced) await log("modlog", autoEmbed);
}
