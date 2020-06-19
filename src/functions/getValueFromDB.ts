import { DbRecord } from "knex";
import { db } from "../lib/database";

export async function getValueFromDB<T>(table: string, column: string, where?: DbRecord<unknown>): Promise<T> {
	const result = where
		? await db.select(column).from(table).where(where)
		: await db.select(column).from(table);
	return result[0]?.[column];
}
