import "server-only";
import { and, eq, gt, lt, sql as dsql } from "drizzle-orm";
import { db } from "@/db";
import { authAttempts } from "@/db/schema";

/**
 * Login rate limiting (anti credential-stuffing).
 *
 * DB-backed, not in-memory: Vercel functions are ephemeral, so a Map would
 * reset on every cold start and attackers ride separate instances anyway.
 *
 * Policy: after MAX_FAILURES failed attempts for the same identifier (login
 * name + IP) within WINDOW_MINUTES, further tries are refused until the
 * window slides past. Rows are pruned as we go.
 *
 * Every helper fails OPEN: if the DB is unreachable, login still works —
 * a broken limiter must never lock every user out of the site.
 */

const MAX_FAILURES = 5;
const WINDOW_MINUTES = 15;

function windowStart(): Date {
  return new Date(Date.now() - WINDOW_MINUTES * 60_000);
}

function keyOf(username: string, ip: string | null): string {
  return `${username.toLowerCase()}|${ip ?? "?"}`.slice(0, 340);
}

/** True when this identifier+IP must be refused before checking credentials. */
export async function isLoginBlocked(
  username: string,
  ip: string | null
): Promise<boolean> {
  try {
    const [row] = await db
      .select({ n: dsql<number>`count(*)::int` })
      .from(authAttempts)
      .where(
        and(
          eq(authAttempts.identifier, keyOf(username, ip)),
          gt(authAttempts.createdAt, windowStart())
        )
      );
    return (row?.n ?? 0) >= MAX_FAILURES;
  } catch {
    return false; // fail open
  }
}

/** Record a failed attempt and prune expired rows for this identifier. */
export async function recordLoginFailure(
  username: string,
  ip: string | null
): Promise<void> {
  try {
    const identifier = keyOf(username, ip);
    await db.insert(authAttempts).values({ identifier, ip });
    await db
      .delete(authAttempts)
      .where(
        and(
          eq(authAttempts.identifier, identifier),
          lt(authAttempts.createdAt, windowStart())
        )
      );
  } catch {
    /* fail open */
  }
}

/** Clear the counter after a successful login. */
export async function clearLoginFailures(
  username: string,
  ip: string | null
): Promise<void> {
  try {
    await db
      .delete(authAttempts)
      .where(eq(authAttempts.identifier, keyOf(username, ip)));
  } catch {
    /* fail open */
  }
}
