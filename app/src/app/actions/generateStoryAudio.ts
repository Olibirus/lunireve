"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { generateSpeech } from "@/lib/ai";
import { getSession } from "@/lib/auth/session";
import { findStory, storyBody } from "@/data/mock-stories";
import type { AudioTier, Language, VoiceType } from "@/lib/ai";
import { STORAGE_BUCKETS, uploadAsset } from "@/lib/supabase/storage";
import { env } from "@/lib/env";

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
 * OpenAI TTS caps input around ~4k characters. Longer stories (ages 7-12 run
 * 800-2100 words) are split at paragraph boundaries and the mp3 chunks are
 * concatenated — MPEG frames are self-contained, so decoders play the joined
 * buffer seamlessly.
 */
const TTS_CHUNK_CHARS = 3500;

function chunkText(text: string): string[] {
  if (text.length <= TTS_CHUNK_CHARS) return [text];
  const chunks: string[] = [];
  let current = "";
  for (const para of text.split(/\n\n+/)) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length > TTS_CHUNK_CHARS && current) {
      chunks.push(current);
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function renderSpeech(
  tier: AudioTier,
  input: { text: string; language: Language; voiceType?: VoiceType; voice?: string; speed?: number }
): Promise<{ audio: Buffer; mimeType: string }> {
  const parts = chunkText(input.text);
  const buffers: Buffer[] = [];
  let mimeType = "audio/mpeg";
  for (const part of parts) {
    const out = await generateSpeech(tier, { ...input, text: part });
    buffers.push(out.audio);
    mimeType = out.mimeType;
  }
  return { audio: Buffer.concat(buffers), mimeType };
}

/**
 * Mock library stories (data/mock-stories.ts) have no DB row, so their cache
 * lives purely in Storage at a deterministic path. A cheap HEAD on the public
 * URL decides cache-hit vs generate.
 */
async function mockStoryAudio(
  slug: string,
  tier: AudioTier,
  isDefaultVoice: boolean,
  voiceArgs: { voiceType?: VoiceType; voice?: string; speed?: number }
): Promise<StoryAudioResult> {
  const story = findStory(slug);
  if (!story) return { ok: false, error: "Story not found." };

  const path = isDefaultVoice
    ? `library-mock/${slug}.mp3`
    : `library-mock/${slug}-${voiceArgs.voiceType}-${voiceArgs.voice ?? "x"}.mp3`;
  const publicUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKETS.audio}/${path}`;

  // Cache check: the file either exists publicly or it doesn't.
  try {
    const head = await fetch(publicUrl, { method: "HEAD", cache: "no-store" });
    if (head.ok) return { ok: true, url: publicUrl, cached: true };
  } catch {
    /* treat as cache miss */
  }

  // Paid render — session required.
  if (!(await getSession())) return { ok: false, error: "auth_required" };

  const text = storyBody(slug, story.language).join("\n\n");
  if (!text.trim()) return { ok: false, error: "Story has no text to narrate." };

  const speech = await renderSpeech(tier, {
    text,
    language: story.language,
    ...voiceArgs,
  });
  const url = await uploadAsset(STORAGE_BUCKETS.audio, path, speech.audio, speech.mimeType);
  return { ok: true, url, cached: false };
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

    // No DB row → it's a mock library story addressed by slug (cache lives in
    // Storage only, until the n8n pipeline moves the library into the DB).
    if (!row) {
      return mockStoryAudio(storyId, tier, isDefaultVoice, {
        voiceType,
        voice: args.voice,
        speed: args.speed,
      });
    }

    // Cache hit: default-voice narration already rendered.
    if (row.audioUrl && isDefaultVoice && !force) {
      return { ok: true, url: row.audioUrl, cached: true };
    }

    // Generation burns TTS credits — anonymous callers only ever get the
    // cached URL above; a session is required to trigger a paid render.
    const session = await getSession();
    if (!session) return { ok: false, error: "auth_required" };

    const text = args.text ?? chaptersToText(row.chapters);
    if (!text.trim()) return { ok: false, error: "Story has no text to narrate." };

    const speech = await renderSpeech(tier, {
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
