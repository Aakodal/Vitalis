import { db } from "../lib/database";

export async function pushValueInDB<T>(table: string, column: string, serverId: string, value: T): Promise<void> {
	await db
		.update({ [column]: value })
		.into(table)
		.where({ server_id: serverId });
}
