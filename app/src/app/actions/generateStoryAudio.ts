"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { generateSpeech } from "@/lib/ai";
import type { AudioTier, Language, VoiceType } from "@/lib/ai";
import { STORAGE_BUCKETS, uploadAsset } from "@/lib/supabase/storage";

/**
 * Lazy audio generation (brief §9.4 + item #11).
 *
 * Audio is NOT generated up front. The first time a reader hits play, this
 * action renders the narration, stores the mp3 in Supabase Storage, caches the
 * URL on `stories.audio_url`, and every later listen streams the cached file.
 * Generating audio for 10k library stories that may never be played would burn
 * money for nothing, hence the on-demand model.
 *
 * Only the default narrator (warm female voice) is cached on the story row.
 * Alternate voices (male / parent voice clone, V2) render to a voice-specific
 * path and are NOT written to `audio_url`; their cache will live in the
 * `story_audio` table described in lib/ai/types.ts when that ships.
 */

export type StoryAudioResult =
  | { ok: true; url: string; cached: boolean }
  | { ok: false; error: string };

/** Join a story's chapters into one narration script. */
function chaptersToText(
  chapters: Array<{ title: string; content: string }>
): string {
  return chapters
    .map((c) => c.content.trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Return the cached narration URL for a story, generating + caching it on the
 * first call. Pass `text` to narrate something other than the stored chapters
 * (e.g. a freshly generated personalized story not yet flattened into chapters).
 */
export async function generateStoryAudio(args: {
  storyId: string;
  /** Override narration text; defaults to the story's chapters. */
  text?: string;
  /** Override language; defaults to the story's stored language. */
  language?: Language;
  tier?: AudioTier;
  voiceType?: VoiceType;
  voice?: string;
  speed?: number;
  force?: boolean;
}): Promise<StoryAudioResult> {
  const {
    storyId,
    tier = "library",
    voiceType = "female",
    force = false,
  } = args;
  const isDefaultVoice = voiceType === "female" && !args.voice;

  try {
    const [row] = await db
      .select({
        audioUrl: stories.audioUrl,
        language: stories.language,
        chapters: stories.chapters,
      })
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1);

    if (!row) return { ok: false, error: "Story not found." };

    // Cache hit: default-voice narration already rendered.
    if (row.audioUrl && isDefaultVoice && !force) {
      return { ok: true, url: row.audioUrl, cached: true };
    }

    const text = args.text ?? chaptersToText(row.chapters);
    if (!text.trim()) return { ok: false, error: "Story has no text to narrate." };

    const speech = await generateSpeech(tier, {
      text,
      language: args.language ?? row.language,
      voiceType,
      voice: args.voice,
      speed: args.speed,
    });

    // Default voice caches at a stable path; alternates get their own path so
    // they never clobber the canonical narration.
    const path = isDefaultVoice
      ? `${storyId}/default.mp3`
      : `${storyId}/${voiceType}-${args.voice ?? "x"}.mp3`;

    const url = await uploadAsset(
      STORAGE_BUCKETS.audio,
      path,
      speech.audio,
      speech.mimeType
    );

    if (isDefaultVoice) {
      await db
        .update(stories)
        .set({ audioUrl: url, updatedAt: new Date() })
        .where(eq(stories.id, storyId));
    }

    return { ok: true, url, cached: false };
  } catch (e) {
    console.error("[Lunireve] audio generation failed:", e);
    return { ok: false, error: "generation_failed" };
  }
}
