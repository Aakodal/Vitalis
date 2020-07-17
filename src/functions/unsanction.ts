import { Guild, MessageEmbed, Snowflake } from "discord.js";
import { db } from "../lib/database";
import { COLORS } from "../lib/constants";
import { log } from "./log";
import { verifUserInDB } from "./verifUserInDB";
import { getMuteRole } from "./getMuteRole";
import { longTimeout } from "./longTimeout";
import { fetchMember } from "./fetchMember";

export async function unsanction(
	id: Snowflake,
	server: Guild,
	sanction: string,
	forced = false,
): Promise<number | NodeJS.Timeout | void> {
	await verifUserInDB(id, server);
	const user = (await db.from("users").where({ server_id: server.id, discord_id: id, actual_sanction: sanction }))[0];

	if (!user) {
		return;
	}

	const { expiration } = user;
	const now = Date.now();

	if (expiration && now < expiration && !forced) {
		return longTimeout(() => {
			unsanction(id, server, sanction);
		}, expiration - now);
	}

	const baseEmbed = new MessageEmbed()
		.setAuthor("Moderation", server.iconURL({ dynamic: true }) as string)
		.setColor(COLORS.lightGreen)
		.setTimestamp();

	const autoEmbed = new MessageEmbed(baseEmbed)
		.setColor(COLORS.gold)
		.setDescription(`[AUTO] ${user.pseudo} has been un${sanction} (sanction timeout).`);

	if (sanction === "muted") {
		const member = await fetchMember(server, id);
		const muteRole = await getMuteRole(server);

		if (member && muteRole && member.roles.cache.get(muteRole.id)) {
			await member.roles.remove(muteRole);
		}

		await db
			.update({
				actual_sanction: null,
				created: null,
				expiration: null,
			})
			.into("users")
			.where({ server_id: server.id, discord_id: id });

		const unmuteEmbed = new MessageEmbed(baseEmbed)
			.setTitle("Unmute")
			.setDescription(`You have been unmuted from ${server.name}.`);
		await user.send(unmuteEmbed);

		if (!forced) {
			await log("mod_log", autoEmbed, server);
		}

		return;
	}
	// else
	const bans = await server.fetchBans();
	if (!bans.get(id)) {
		return;
	}

	await server.members.unban(id, "[AUTO] Sanction finished.");
	await db
		.update({
			actual_sanction: null,
			created: null,
			expiration: null,
		})
		.into("users")
		.where({ server_id: server.id, discord_id: id });

	if (!forced) {
		await log("mod_log", autoEmbed, server);
	}
}
