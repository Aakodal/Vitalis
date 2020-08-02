import { Snowflake, User } from "discord.js";
import { client } from "../index";

export async function fetchUser(id: Snowflake | string): Promise<User | undefined> {
	try {
		return await client.users.fetch(id);
	} catch {}
}
