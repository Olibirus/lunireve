"use server";

import { getSession, getCurrentUserId } from "@/lib/auth/session";
import {
  insertCustomStory,
  selectCustomStory,
  selectCustomStoriesByUser,
} from "@/db/customStories";
import type { CustomStory, CustomStoryParams } from "@/lib/customStories";

/**
 * Server actions for DB-backed personalized stories (the localStorage swap).
 *
 * Session B's client store (lib/customStories.ts) can call these instead of
 * touching localStorage: `saveCustomStoryToDb` on create, `fetchCustomStory`
 * to resolve a shared link on any device, `listMyCustomStories` for the account
 * library. The UI-facing `CustomStory` shape is preserved so the swap is a
 * call-site change, not a reshape.
 */

export async function saveCustomStoryToDb(input: {
  title: string;
  body: string[];
  params: CustomStoryParams;
  profileId: string | null;
}): Promise<{ ok: true; id: string } | { ok: false }> {
  // Must be signed in to create (matches the existing /creer gate).
  const session = await getSession();
  if (!session) return { ok: false };

  try {
    const id = await insertCustomStory({
      title: input.title,
      body: input.body,
      params: input.params,
      profileId: input.profileId,
      // Temp accounts have no Supabase uuid -> story is unattributed but still
      // resolvable by link. Real accounts own the row for their library.
      ownerUserId: session.userId ?? null,
    });
    return { ok: true, id };
  } catch (e) {
    console.error("[Lunireve] saveCustomStoryToDb failed:", e);
    return { ok: false };
  }
}

/** Resolve a shared personalized-story link. Public: no auth required. */
export async function fetchCustomStory(id: string): Promise<CustomStory | null> {
  try {
    return await selectCustomStory(id);
  } catch (e) {
    console.error("[Lunireve] fetchCustomStory failed:", e);
    return null;
  }
}

/** The signed-in user's personalized stories. Empty for temp accounts. */
export async function listMyCustomStories(): Promise<CustomStory[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  try {
    return await selectCustomStoriesByUser(userId);
  } catch (e) {
    console.error("[Lunireve] listMyCustomStories failed:", e);
    return [];
  }
}
