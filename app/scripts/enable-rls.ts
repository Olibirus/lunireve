/**
 * Enable Row Level Security on every public table + create auth_attempts.
 *
 *   pnpm exec dotenv -e .env.local -- tsx scripts/enable-rls.ts
 *
 * The app talks to Postgres via the service role / direct connection (both
 * bypass RLS), so enabling RLS with NO policies simply shuts the public
 * PostgREST door: the browser anon key can no longer read or write any table.
 * When the full Supabase Auth swap lands, per-user policies get added on top.
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

async function main() {
  // Rate-limit journal for login attempts (one row per failure).
  await sql`
    create table if not exists auth_attempts (
      id uuid primary key default gen_random_uuid(),
      identifier varchar(340) not null,
      ip varchar(64),
      created_at timestamptz not null default now()
    )`;
  await sql`create index if not exists auth_attempts_ident_time_idx
    on auth_attempts (identifier, created_at)`;
  console.log("auth_attempts table ready");

  const tables = await sql`
    select tablename from pg_tables where schemaname = 'public'`;
  for (const t of tables) {
    await sql.unsafe(`alter table "${t.tablename}" enable row level security`);
    console.log("RLS enabled:", t.tablename);
  }

  const check = await sql`
    select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename`;
  const off = check.filter((r) => !r.rowsecurity);
  console.log(off.length === 0 ? "\nALL TABLES PROTECTED" : `\nSTILL OFF: ${off.map((r) => r.tablename)}`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
