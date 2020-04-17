import { Snowflake } from "discord.js";
import { client } from "../main";

export async function fetchUser(id: Snowflake | string) {
	try {
		return await client.users.fetch(id);
	} catch (error) {
		return undefined;
	}
}
