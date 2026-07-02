/** Post-RLS smoke test: the app's Drizzle path must still read and write. */
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { stories, users, authAttempts } from "@/db/schema";

async function main() {
  const [s] = await db.select({ n: sql<number>`count(*)::int` }).from(stories);
  const [u] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  await db.insert(authAttempts).values({ identifier: "smoke|test", ip: "0.0.0.0" });
  const [a] = await db.select({ n: sql<number>`count(*)::int` }).from(authAttempts);
  await db.delete(authAttempts);
  console.log(`stories: ${s.n}  users: ${u.n}  auth_attempts write/read: ok (${a.n} rows)`);
  process.exit(0);
}
main().catch((e) => { console.error("SMOKE FAILED:", (e as Error).message); process.exit(1); });
