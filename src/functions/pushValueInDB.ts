import { db } from "../lib/database";

export async function pushValueInDB(table: string, column: string, value: any) {
	await db.update({
		[column]: value,
	}).into(table);
}
