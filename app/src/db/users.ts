import "server-only";
import { db } from "./index";
import { users } from "./schema";

/**
 * Ensure a row exists in the app-level `users` table mirroring auth.users.
 *
 * Supabase Auth owns identity; this shadow row owns app profile data and is the
 * FK target for everything a user owns (stories, profiles, favorites...).
 * Called right after a Supabase account is created (and idempotently on login)
 * so user-owned writes never trip an FK violation.
 */
export async function ensureUserRow(input: {
  id: string;
  email: string;
  firstName?: string | null;
}): Promise<void> {
  await db
    .insert(users)
    .values({
      id: input.id,
      email: input.email,
      firstName: input.firstName ?? null,
    })
    .onConflictDoNothing({ target: users.id });
}
