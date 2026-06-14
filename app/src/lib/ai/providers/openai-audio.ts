import OpenAI from "openai";
import { env } from "@/lib/env";
import type { AudioProvider, VoiceType } from "../types";

/**
 * OpenAI TTS provider.
 *
 * Model: gpt-4o-mini-tts — far more natural than the older tts-1 / tts-1-hd
 * voices (which sound robotic), and it accepts an `instructions` field so we can
 * direct a soft, soothing bedtime delivery. Cost stays low and bulk-friendly.
 *
 * Voice is chosen from voiceType; "coral" is a warm female narrator that tested
 * well for gentle French read-aloud. Pacing/tone come from `instructions`
 * (gpt-4o-mini-tts ignores the legacy `speed` param), so we don't send speed.
 */

const MODEL = "gpt-4o-mini-tts";

// Warm, gentle defaults per narrator gender. "clone" falls back to female until
// the V2 voice-cloning table ships.
const VOICE_BY_TYPE: Record<VoiceType, string> = {
  female: "coral",
  male: "onyx",
  clone: "coral",
};

const BEDTIME_INSTRUCTIONS =
  "Speak as a warm, loving bedtime storyteller for a young child. Soft, soothing, and unhurried, with gentle warmth and tenderness. Calm, lulling pace as if helping the child drift off to sleep. Never rushed, never harsh.";

function getClient() {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export const openaiAudioProvider: AudioProvider = {
  async generateSpeech(input) {
    const client = getClient();

    const voice = input.voice ?? VOICE_BY_TYPE[input.voiceType ?? "female"];

    const res = await client.audio.speech.create({
      model: MODEL,
      voice,
      input: input.text,
      instructions: BEDTIME_INSTRUCTIONS,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await res.arrayBuffer());
    return { audio: buffer, mimeType: "audio/mpeg", model: MODEL };
  },
};
