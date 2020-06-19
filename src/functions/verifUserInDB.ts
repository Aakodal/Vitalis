import { Guild, Snowflake } from "discord.js";
import { client } from "../index";
import { db } from "../lib/database";

export async function verifUserInDB(userID: Snowflake, server: Guild): Promise<void> {
	const user = await client.users.fetch(userID);

	const userInDB = await db.from("users").where({ server_id: server.id, discord_id: userID });

	if (!userInDB[0]) {
		await db
			.insert({
				server_id: server.id,
				discord_id: userID,
				pseudo: user.tag,
			})
			.into("users");
	}
}
