import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDataBase(database: SQLiteDatabase) {
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS residuo(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            categoria TEXT NOT NULL,
            peso REAL NOT NULL
        );
    `);
}