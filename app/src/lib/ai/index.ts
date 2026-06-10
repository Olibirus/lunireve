import { env } from "@/lib/env";
import type {
  AudioProvider,
  AudioTier,
  ImageProvider,
  ImageTier,
  SpeechGenerationInput,
  SpeechGenerationOutput,
  StoryGenerationInput,
  StoryGenerationOutput,
  ImageGenerationInput,
  ImageGenerationOutput,
  TextProvider,
} from "./types";

import { anthropicTextProvider } from "./providers/anthropic-text";
import { openaiTextProvider } from "./providers/openai-text";
import { openaiImageProvider } from "./providers/openai-image";
import { replicateImageProvider } from "./providers/replicate-image";
import { openaiAudioProvider } from "./providers/openai-audio";
import { elevenlabsAudioProvider } from "./providers/elevenlabs-audio";

/**
 * Single entry point for every AI call in the app.
 *
 * The rest of the codebase calls `generateStoryText()`, `generateImage(tier, ...)`,
 * `generateSpeech(tier, ...)` and never touches an SDK directly. To swap a
 * provider, change the env var — code doesn't move.
 *
 * Tiers exist because library and personalized outputs have different cost
 * envelopes: library is bulk + cached, personalized is user-facing and benefits
 * from spending more per piece (better voices, better images).
 */

function getTextProvider(): TextProvider {
  switch (env.TEXT_PROVIDER) {
    case "anthropic":
      return anthropicTextProvider;
    case "openai":
      return openaiTextProvider;
  }
}

function getImageProvider(tier: ImageTier): ImageProvider {
  const provider =
    tier === "library" ? env.IMAGE_PROVIDER_LIBRARY : env.IMAGE_PROVIDER_PERSONALIZED;
  switch (provider) {
    case "openai":
      return openaiImageProvider;
    case "replicate":
      return replicateImageProvider;
  }
}

function getAudioProvider(tier: AudioTier): AudioProvider {
  const provider =
    tier === "library" ? env.AUDIO_PROVIDER_LIBRARY : env.AUDIO_PROVIDER_PERSONALIZED;
  switch (provider) {
    case "openai":
      return openaiAudioProvider;
    case "elevenlabs":
      return elevenlabsAudioProvider;
  }
}

// --- Public API ---

export function generateStoryText(
  input: StoryGenerationInput
): Promise<StoryGenerationOutput> {
  return getTextProvider().generateStory(input);
}

export function generateImage(
  tier: ImageTier,
  input: ImageGenerationInput
): Promise<ImageGenerationOutput> {
  return getImageProvider(tier).generateImage(input);
}

export function generateSpeech(
  tier: AudioTier,
  input: SpeechGenerationInput
): Promise<SpeechGenerationOutput> {
  return getAudioProvider(tier).generateSpeech(input);
}

export type {
  StoryGenerationInput,
  StoryGenerationOutput,
  ImageGenerationInput,
  ImageGenerationOutput,
  SpeechGenerationInput,
  SpeechGenerationOutput,
  Language,
  AgeRange,
  ImageTier,
  AudioTier,
} from "./types";
