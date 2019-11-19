import { db } from "../lib/database";

export async function getValueFromDB(table: string, column: string): Promise<any | null> {
	const result = await db.select(column).from(table);
	return result[0][column]
		? result[0][column]
		: null;
}
