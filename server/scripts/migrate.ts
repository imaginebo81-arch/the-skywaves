import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { Client } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Provide the direct Postgres connection string.");
    process.exit(1);
  }

  const file = path.resolve(process.cwd(), "supabase/migrations/0001_init.sql");
  const sql = readFileSync(file, "utf-8");

  const ssl = /\bsslmode=require\b/.test(connectionString) || process.env.PGSSL === "true"
    ? { rejectUnauthorized: false }
    : undefined;

  const client = new Client({ connectionString, ssl });
  await client.connect();
  try {
    await client.query(sql);
    console.log("migration applied: supabase/migrations/0001_init.sql");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("migration failed:", err.message ?? err);
  process.exit(1);
});
