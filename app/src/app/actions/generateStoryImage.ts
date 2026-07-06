"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { generateImage } from "@/lib/ai";
import { getSession } from "@/lib/auth/session";
import type { ImageGenerationInput, ImageTier } from "@/lib/ai";
import { STORAGE_BUCKETS, fetchToBuffer, uploadAsset } from "@/lib/supabase/storage";

/**
 * Image generation, wired end to end (brief item #11 + §9).
 *
 * Flow: provider layer -> normalize to PNG bytes -> Supabase Storage -> cache
 * the stable URL on the story row. The rest of the app only ever sees the
 * Supabase URL; provider URLs (OpenAI base64, Replicate temp links) never get
 * persisted because they expire.
 *
 * Two entry points:
 * - `generateStoryImage` caches onto a `stories` row (hero/mid slot). Library
 *   pipeline (n8n) and on-demand story rendering both use this.
 * - `generateStandaloneImage` returns a URL without touching the DB, for callers
 *   that own their own persistence (personalized illustration previews).
 */

/** Which cached image column to fill. Picture-story page images land in V1.1. */
export type ImageSlot = "hero" | "mid";

export type StoryImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

async function runImage(
  tier: ImageTier,
  input: ImageGenerationInput,
  storagePath: string
): Promise<string> {
  const out = await generateImage(tier, input);
  const bytes = await fetchToBuffer(out.imageUrl);
  return uploadAsset(STORAGE_BUCKETS.images, storagePath, bytes, "image/png");
}

/**
 * Generate + cache a story illustration. If the slot is already populated and
 * `force` is false, returns the cached URL without spending a generation.
 */
export async function generateStoryImage(args: {
  storyId: string;
  slot: ImageSlot;
  prompt: string;
  /** Library stories use the cheap bulk tier; personalized use the better one. */
  tier?: ImageTier;
  size?: ImageGenerationInput["size"];
  quality?: ImageGenerationInput["quality"];
  /** Keep a character/style reference consistent across a story's images. */
  referenceImageUrl?: string;
  force?: boolean;
}): Promise<StoryImageResult> {
  const { storyId, slot, prompt, tier = "library", force = false } = args;

  // Paid generation — session required (admin runs the library pipeline).
  if (!(await getSession())) return { ok: false, error: "auth_required" };

  try {
    const [row] = await db
      .select({
        hero: stories.heroImageUrl,
        mid: stories.midImageUrl,
      })
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1);

    if (!row) return { ok: false, error: "Story not found." };

    const cached = slot === "hero" ? row.hero : row.mid;
    if (cached && !force) return { ok: true, url: cached };

    const url = await runImage(
      tier,
      {
        prompt,
        size: args.size,
        quality: args.quality,
        referenceImageUrl: args.referenceImageUrl,
      },
      `${storyId}/${slot}.png`
    );

    await db
      .update(stories)
      .set(
        slot === "hero"
          ? { heroImageUrl: url, updatedAt: new Date() }
          : { midImageUrl: url, updatedAt: new Date() }
      )
      .where(eq(stories.id, storyId));

    return { ok: true, url };
  } catch (e) {
    console.error("[Lunireve] image generation failed:", e);
    return { ok: false, error: "generation_failed" };
  }
}

/**
 * Generate an image and return its stored URL without persisting to a story
 * row. The caller decides where the URL lives (e.g. a personalized preview).
 */
export async function generateStandaloneImage(args: {
  prompt: string;
  storagePath: string;
  tier?: ImageTier;
  size?: ImageGenerationInput["size"];
  quality?: ImageGenerationInput["quality"];
  referenceImageUrl?: string;
}): Promise<StoryImageResult> {
  // Paid generation — session required.
  if (!(await getSession())) return { ok: false, error: "auth_required" };

  try {
    const url = await runImage(
      args.tier ?? "personalized",
      {
        prompt: args.prompt,
        size: args.size,
        quality: args.quality,
        referenceImageUrl: args.referenceImageUrl,
      },
      args.storagePath
    );
    return { ok: true, url };
  } catch (e) {
    console.error("[Lunireve] standalone image generation failed:", e);
    return { ok: false, error: "generation_failed" };
  }
}
