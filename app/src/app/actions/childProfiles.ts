"use server";

import { getSession } from "@/lib/auth/session";
import {
  accountUuid,
  ensureUserRow,
  selectChildProfiles,
  upsertChildProfile,
  deleteChildProfileRow,
} from "@/db/childProfiles";
import type { ChildProfile } from "@/lib/profiles";

/**
 * Cross-device child profiles. Every call resolves the account from the
 * session cookie, so a profile added on one device shows up on the next.
 */

async function account(): Promise<{ id: string; email: string } | null> {
  const session = await getSession();
  if (!session) return null;
  const id = accountUuid({ userId: session.userId, username: session.username });
  // Temp logins have no users row; the FK on child_profiles needs one.
  const email = session.username.includes("@")
    ? session.username
    : `${session.username}@temp.lunireve.local`;
  return { id, email };
}

export async function listMyChildProfiles(): Promise<ChildProfile[]> {
  const acc = await account();
  if (!acc) return [];
  try {
    return await selectChildProfiles(acc.id);
  } catch (e) {
    console.error("[Lunireve] listMyChildProfiles failed:", e);
    return [];
  }
}

/** Create or update one profile. Called on every local mutation. */
export async function saveChildProfile(profile: ChildProfile): Promise<{ ok: boolean }> {
  const acc = await account();
  if (!acc) return { ok: false };
  try {
    await ensureUserRow(acc.id, acc.email);
    await upsertChildProfile(acc.id, profile);
    return { ok: true };
  } catch (e) {
    console.error("[Lunireve] saveChildProfile failed:", e);
    return { ok: false };
  }
}

/** Push the whole local set at once (first sync from a device that has data). */
export async function saveChildProfiles(profiles: ChildProfile[]): Promise<{ ok: boolean }> {
  const acc = await account();
  if (!acc) return { ok: false };
  try {
    await ensureUserRow(acc.id, acc.email);
    for (const p of profiles) await upsertChildProfile(acc.id, p);
    return { ok: true };
  } catch (e) {
    console.error("[Lunireve] saveChildProfiles failed:", e);
    return { ok: false };
  }
}

export async function deleteChildProfile(id: string): Promise<{ ok: boolean }> {
  const acc = await account();
  if (!acc) return { ok: false };
  try {
    await deleteChildProfileRow(acc.id, id);
    return { ok: true };
  } catch (e) {
    console.error("[Lunireve] deleteChildProfile failed:", e);
    return { ok: false };
  }
}
