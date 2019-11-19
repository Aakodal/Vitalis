import { Guild, RichEmbed, Snowflake } from "discord.js";
import { db } from "../lib/database";
import { COLORS } from "../lib/constants";
import { log } from "./log";
import { verifUserInDB } from "./verifUserInDB";
import { getMuteRole } from "./getMuteRole";

export async function unsanction(id: Snowflake, server: Guild, sanction: string, forced: boolean) {
	await verifUserInDB(id);
	const user = (await db.from("users").where({ discord_id: id, actual_sanction: sanction }))[0];

	if (!user?.expiration) return;

	const { expiration } = user;
	const now = Date.now();

	if (now < expiration && !forced) {
		return setTimeout(() => {
			unsanction(id, server, sanction, false);
		}, expiration - now);
	}

	const embed = new RichEmbed()
		.setAuthor("Moderation", server.iconURL)
		.setColor(COLORS.light_green)
		.setDescription(`You have been unmuted from ${server.name}`)
		.setTimestamp();

	const autoEmbed = new RichEmbed()
		.setAuthor("Moderation", server.iconURL)
		.setColor(COLORS.gold)
		.setDescription(`[AUTO] ${user.pseudo} has been un${sanction} (sanction timeout)`)
		.setTimestamp();

	if (sanction === "muted") {
		const member = server.members.get(id);
		const muteRole = await getMuteRole(server);

		if (!member
			|| !muteRole) return;

		if (member.roles.get(muteRole.id)) await member.removeRole(muteRole);
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
	const bans = await server.fetchBans(false);
	if (!bans.get(id)) return;

	await server.unban(id, "[AUTO] Sanction finished.");
	await db.update({
		actual_sanction: null,
		created: null,
		expiration: null,
	}).into("users").where({ discord_id: id });

	if (!forced) await log("modlog", autoEmbed);
}
