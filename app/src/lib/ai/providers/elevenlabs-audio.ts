import { env } from "@/lib/env";
import type { AudioProvider } from "../types";

/**
 * ElevenLabs TTS provider. Used for personalized stories (default) — the voices
 * are noticeably warmer and better in French. V2 will add voice cloning so
 * parents can narrate in their own voice; the interface is already shaped for it
 * via the `voice` parameter.
 */

// "Charlotte" — warm bilingual FR/EN voice; swap per locale if we want.
const DEFAULT_VOICE_ID = "XB0fDUnXU5powFXDhCwa";
const MODEL = "eleven_multilingual_v2";

export const elevenlabsAudioProvider: AudioProvider = {
  async generateSpeech(input) {
    if (!env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not set.");
    }

    const voiceId = input.voice ?? DEFAULT_VOICE_ID;

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input.text,
          model_id: MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`ElevenLabs TTS failed: ${res.status} ${await res.text()}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return { audio: buffer, mimeType: "audio/mpeg", model: MODEL };
  },
};
