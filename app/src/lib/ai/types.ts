/**
 * Provider-neutral types for AI operations.
 *
 * The whole AI layer is built around one principle: the rest of the app must
 * NEVER import an SDK directly. It calls `generateStoryText()`, `generateImage()`,
 * `generateSpeech()` — these functions read env vars and dispatch to the right
 * provider. Swapping Anthropic→OpenAI or OpenAI→Replicate = flip one env var.
 */

// ---------- Text ----------

export type Language = "fr" | "en";

export type AgeRange = "1-2" | "3-4" | "5-6" | "7-8" | "9-10" | "11-12";

export interface StoryGenerationInput {
  language: Language;
  ageRange: AgeRange;
  /** Free-form prompt: theme, characters, moral, etc. */
  prompt: string;
  /** Character reference sheet URLs or names to include consistently. */
  characters?: Array<{ name: string; description: string }>;
  /** Target word count — enforced loosely. */
  targetWords?: number;
  /** SEO keyword to weave in naturally, library stories only. */
  seoKeyword?: string;
}

export interface StoryGenerationOutput {
  title: string;
  /** Story broken into scenes so each can later be paired with an illustration. */
  scenes: Array<{
    text: string;
    /** Prompt the image provider will receive for this scene. */
    imagePrompt: string;
  }>;
  /** Full running text, useful for TTS and full-page view. */
  fullText: string;
  /** Model that generated this, for provenance + debugging. */
  model: string;
}

export interface TextProvider {
  generateStory(input: StoryGenerationInput): Promise<StoryGenerationOutput>;
}

// ---------- Image ----------

export type ImageTier = "library" | "personalized";

export interface ImageGenerationInput {
  prompt: string;
  /** If set, forces stylistic consistency with an existing reference. */
  referenceImageUrl?: string;
  /** 1024x1024 recommended for web display, 2048 for print-ready. */
  size?: "1024x1024" | "1792x1024" | "1024x1792" | "2048x2048";
  /** Passed through to provider; useful for picking between quality tiers. */
  quality?: "standard" | "hd";
}

export interface ImageGenerationOutput {
  /** Either a hosted URL or a base64 data URL — caller uploads to storage. */
  imageUrl: string;
  model: string;
}

export interface ImageProvider {
  generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput>;
}

// ---------- Audio ----------

export type AudioTier = "library" | "personalized";

/**
 * Voice selection (#25). Default is a warm female narrator for every story.
 * "male" is a V2 option; "clone" plays a voice the parent/grandparent
 * recorded (a sample uploaded and cloned, NOT a recording of the story).
 * The DB plan: stories.audio_url stays the default-voice cache; a separate
 * `story_audio(profile_id, story_id, voice_type, voice_clone_id, url)` table
 * holds per-voice renders so each family can have its own narrator.
 */
export type VoiceType = "female" | "male" | "clone";

export interface SpeechGenerationInput {
  text: string;
  language: Language;
  /** Default narrator gender; female unless overridden. */
  voiceType?: VoiceType;
  /** Provider voice id (resolved from voiceType) or a cloned-voice id. */
  voice?: string;
  /** Set when voiceType === "clone": the parent's cloned-voice reference. */
  voiceCloneId?: string;
  /** 1.0 = normal speed. Gentle slowdown for young ears: 0.9. */
  speed?: number;
}

export interface SpeechGenerationOutput {
  /** mp3 bytes; caller writes to Supabase Storage and stores the URL. */
  audio: Buffer;
  mimeType: string;
  model: string;
}

export interface AudioProvider {
  generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput>;
}
