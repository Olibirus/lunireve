import OpenAI from "openai";
import { env } from "@/lib/env";
import type { AudioProvider } from "../types";

/**
 * OpenAI TTS provider. Used for library stories (default): voices are good
 * enough, cost is ~15x lower than ElevenLabs, bulk-friendly.
 */

const MODEL = "tts-1-hd";
const DEFAULT_VOICE = "nova"; // warm, slightly feminine — tested well for FR narration

function getClient() {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export const openaiAudioProvider: AudioProvider = {
  async generateSpeech(input) {
    const client = getClient();

    const res = await client.audio.speech.create({
      model: MODEL,
      voice: (input.voice ?? DEFAULT_VOICE) as
        | "alloy"
        | "echo"
        | "fable"
        | "onyx"
        | "nova"
        | "shimmer",
      input: input.text,
      speed: input.speed ?? 0.95,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await res.arrayBuffer());
    return { audio: buffer, mimeType: "audio/mpeg", model: MODEL };
  },
};
