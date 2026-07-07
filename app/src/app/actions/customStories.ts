"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { getSession, getCurrentUserId } from "@/lib/auth/session";
import { generateImage } from "@/lib/ai";
import { personalizedImagePrompt } from "@/lib/ai/stylePrompts";
import { STORAGE_BUCKETS, fetchToBuffer, uploadAsset } from "@/lib/supabase/storage";
import {
  insertCustomStory,
  selectCustomStory,
  selectCustomStoriesByUser,
  selectCustomStoryImageInputs,
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

export type StoryImageState =
  | { ok: true; url: string; cached: boolean }
  | { ok: false };

/**
 * Lazy illustration for a personalized story (mirrors the audio pattern):
 * generated at first view, uploaded to Supabase Storage, cached on the row
 * so every later visit is free.
 *
 * Session-gated: generation burns provider credits, so anonymous callers only
 * ever receive an already-cached URL — they can never trigger a paid call.
 */
export async function ensureCustomStoryImage(id: string): Promise<StoryImageState> {
  try {
    const inputs = await selectCustomStoryImageInputs(id);
    if (!inputs) return { ok: false };
    if (inputs.heroImageUrl) return { ok: true, url: inputs.heroImageUrl, cached: true };

    const session = await getSession();
    if (!session) return { ok: false };

    const out = await generateImage("personalized", {
      prompt: personalizedImagePrompt(inputs.style, inputs.imagePrompt, inputs.character),
      size: "1024x1024",
    });
    const bytes = await fetchToBuffer(out.imageUrl);
    const url = await uploadAsset(
      STORAGE_BUCKETS.images,
      `${id}/hero.png`,
      bytes,
      "image/png"
    );

    await db
      .update(stories)
      .set({ heroImageUrl: url, updatedAt: new Date() })
      .where(eq(stories.id, id));

    return { ok: true, url, cached: false };
  } catch (e) {
    console.error("[Lunireve] ensureCustomStoryImage failed:", e);
    return { ok: false };
  }
}
