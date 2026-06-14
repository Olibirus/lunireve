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
  female: "nova",
  male: "marin",
  clone: "nova",
};

// Keep the delivery warm but flowing. Earlier wording about "slow / unhurried /
// lulling" made nova drag with long mid-sentence pauses; we want a soft parent
// voice that still moves.
const BEDTIME_INSTRUCTIONS =
  "Speak as a warm, loving parent reading a bedtime story to their young child. Soft, tender, and affectionate, with a gentle smile in the voice. Natural reading rhythm: keep words flowing together within each sentence, no long pauses between words. Pause only at commas and periods.";

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
