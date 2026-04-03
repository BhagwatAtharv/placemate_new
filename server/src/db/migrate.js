import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

function splitSql(sql) {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function migrate() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const schemaPath = path.resolve(__dirname, "../../sql/schema.sql");

  const sql = await fs.readFile(schemaPath, "utf8");
  const statements = splitSql(sql);

  for (const stmt of statements) {
    await pool.execute(stmt);
  }
}
