import { db } from "../lib/database";

export async function getValueFromDB<T>(table: string, column: string): Promise<T> {
	const result = await db.select(column).from(table);
	return result[0][column]
		? result[0][column]
		: null;
}
