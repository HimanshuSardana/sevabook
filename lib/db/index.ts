import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import * as relations from "./relations";

const fullSchema = { ...schema, ...relations };
import path from "path";

const dbPath = path.join(process.cwd(), "data", "sevabook.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema: fullSchema });
export { schema, relations };
