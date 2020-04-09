import { Snowflake } from "discord.js";
import { client } from "../main";
import { db } from "../lib/database";

export async function verifUserInDB(userID: Snowflake) {
	const user = client.users.cache.get(userID);

	if (user.partial) await user.fetch();

	const userInDB = await db
		.from("users")
		.where({ discord_id: userID });

	if (!userInDB[0]) {
		await db
			.insert({
				discord_id: userID,
				pseudo: user.tag,
			})
			.into("users");
	}
}
