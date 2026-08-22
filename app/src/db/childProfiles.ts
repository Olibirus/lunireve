import "server-only";
import { and, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db } from "./index";
import { childProfiles, users } from "./schema";
import { ageToRange } from "@/data/mock-stories";
import type { ChildProfile } from "@/lib/profiles";

/**
 * DB-backed child profiles — the piece that makes an account behave like one
 * account instead of one-account-per-browser.
 *
 * Profiles used to live only in localStorage, so adding a child on a phone was
 * invisible on a laptop. Rows here are the source of truth; the client store
 * keeps a local copy purely as a cache for instant first paint.
 *
 * The columns that predate the client shape (avatar, language, streak...) ride
 * along in `appearance`, which is a jsonb bag on the same row. It is a
 * deliberate shortcut to avoid a migration: everything the UI needs stays
 * together, and Phase 2 can promote the fields to real columns without the
 * client contract changing.
 */

type ClientBag = {
  avatar: ChildProfile["avatar"];
  language: ChildProfile["language"];
  maxDuration: ChildProfile["maxDuration"];
  age: number;
  streak: number;
  lastReadDate: string | null;
  ageSetAt?: string;
};

/**
 * The account uuid to file profiles under.
 *
 * Real accounts carry a Supabase uuid. The temp logins (user/user2/admin) have
 * none, so they get a stable uuid derived from the username: the same test
 * account then syncs across devices exactly like a real one, instead of
 * silently staying local and looking like the sync is broken.
 */
export function accountUuid(input: { userId?: string | null; username: string }): string {
  if (input.userId) return input.userId;
  const h = createHash("sha256").update(`lunireve:temp:${input.username}`).digest("hex");
  // Format the digest as a v4-shaped uuid so it satisfies the uuid column.
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    `4${h.slice(13, 16)}`,
    `8${h.slice(17, 20)}`,
    h.slice(20, 32),
  ].join("-");
}

/**
 * child_profiles.user_id is a FK, so the row has to exist before any profile
 * can be attached. Real signups create it; temp logins get one on first sync.
 */
export async function ensureUserRow(id: string, email: string): Promise<void> {
  await db
    .insert(users)
    .values({ id, email })
    .onConflictDoNothing({ target: users.id });
}

function rowToProfile(row: typeof childProfiles.$inferSelect): ChildProfile {
  const bag = (row.appearance ?? {}) as Partial<ClientBag>;
  return {
    id: row.id,
    name: row.name,
    age: bag.age ?? parseInt(row.ageRange, 10) ?? 6,
    avatar: bag.avatar ?? "golden",
    language: bag.language ?? "fr",
    themes: row.favoriteThemes ?? [],
    maxDuration: bag.maxDuration ?? "none",
    streak: bag.streak ?? 0,
    lastReadDate: bag.lastReadDate ?? null,
    createdAt: (row.createdAt ?? new Date()).toISOString(),
    ageSetAt: bag.ageSetAt,
  };
}

export async function selectChildProfiles(userId: string): Promise<ChildProfile[]> {
  const rows = await db.select().from(childProfiles).where(eq(childProfiles.userId, userId));
  return rows
    .map(rowToProfile)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Insert or update one profile, keyed by the id the client generated. */
export async function upsertChildProfile(userId: string, p: ChildProfile): Promise<void> {
  const bag: ClientBag = {
    avatar: p.avatar,
    language: p.language,
    maxDuration: p.maxDuration,
    age: p.age,
    streak: p.streak,
    lastReadDate: p.lastReadDate,
    ageSetAt: p.ageSetAt,
  };
  const values = {
    id: p.id,
    userId,
    name: p.name,
    ageRange: ageToRange(p.age) as typeof childProfiles.$inferInsert.ageRange,
    favoriteThemes: p.themes ?? [],
    appearance: bag as unknown as typeof childProfiles.$inferInsert.appearance,
    updatedAt: new Date(),
  };
  await db
    .insert(childProfiles)
    .values(values)
    .onConflictDoUpdate({ target: childProfiles.id, set: values });
}

export async function deleteChildProfileRow(userId: string, id: string): Promise<void> {
  await db
    .delete(childProfiles)
    .where(and(eq(childProfiles.id, id), eq(childProfiles.userId, userId)));
}
