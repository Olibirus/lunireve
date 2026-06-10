import { defineConfig } from "drizzle-kit";
import "dotenv/config";

/**
 * Drizzle Kit config.
 *
 * For migrations we use DIRECT_DATABASE_URL (Supabase port 5432, not 6543).
 * PgBouncer's transaction pooler does not support the DDL / advisory locks that
 * `drizzle-kit push` and `migrate` rely on. Falls back to DATABASE_URL for
 * local Postgres dev setups that don't have a pooler.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
