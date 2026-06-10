import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Drizzle client pointed at the Supabase Postgres pooler.
 *
 * We use `postgres-js` with `prepare: false` because Supabase's PgBouncer in
 * transaction mode does not support prepared statements. The pooled URL (port 6543)
 * is what DATABASE_URL should point at for serverless / edge-adjacent workloads.
 *
 * For migrations (drizzle-kit push/migrate), use the direct connection URL
 * (port 5432) — see drizzle.config.ts.
 */

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Cannot connect to Postgres.");
  }
  return postgres(env.DATABASE_URL, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
  });
}

// Reuse the connection across hot reloads in dev to avoid exhausting the pool.
const client =
  env.NODE_ENV === "production"
    ? createClient()
    : (globalThis.__pgClient ??= createClient());

export const db = drizzle(client, { schema });
export type DB = typeof db;
