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
  deleteCustomStoryRow,
  appendStoryFeedback,
  selectRecentStoryFeedback,
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

/**
 * Record a thumbs up/down on a personalized story. Fired on the FIRST click
 * (no reason needed); an optional follow-up call carries the reason.
 */
export async function recordStoryFeedback(
  id: string,
  verdict: "up" | "down",
  reason?: string
): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session) return { ok: false };
  try {
    return {
      ok: await appendStoryFeedback(id, {
        verdict,
        reason: reason?.slice(0, 120) || undefined,
        at: new Date().toISOString(),
        // One entry per voter: repeat clicks / added reasons update it.
        by: session.username,
      }),
    };
  } catch (e) {
    console.error("[Lunireve] recordStoryFeedback failed:", e);
    return { ok: false };
  }
}

/** Admin: all recorded story feedback, newest first. */
export async function listStoryFeedback(): Promise<
  { storyId: string; title: string; verdict: "up" | "down"; reason?: string; at: string }[]
> {
  const session = await getSession();
  if (session?.role !== "admin") return [];
  try {
    return await selectRecentStoryFeedback();
  } catch (e) {
    console.error("[Lunireve] listStoryFeedback failed:", e);
    return [];
  }
}

/** Delete a personalized story (parent profile). Session + owner guarded. */
export async function deleteMyCustomStory(id: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session) return { ok: false };
  try {
    return { ok: await deleteCustomStoryRow(id, session.userId ?? null) };
  } catch (e) {
    console.error("[Lunireve] deleteMyCustomStory failed:", e);
    return { ok: false };
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

    // Sequels reuse the previous episode's illustration as a character
    // reference, so the hero looks the same from one episode to the next.
    let referenceImageUrl: string | undefined;
    if (inputs.sequelOfId) {
      try {
        const prev = await selectCustomStoryImageInputs(inputs.sequelOfId);
        referenceImageUrl = prev?.heroImageUrl ?? undefined;
      } catch {
        /* reference is best-effort */
      }
    }

    const out = await generateImage("personalized", {
      prompt: personalizedImagePrompt(inputs.style, inputs.imagePrompt, inputs.character),
      referenceImageUrl,
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
