/**
 * Generate short narration samples across OpenAI voices so we can pick the
 * warmest one for kids' bedtime stories.
 *
 *   pnpm voice:samples            # default voice set
 *   pnpm voice:samples ballad sage shimmer
 *
 * Same model (gpt-4o-mini-tts) + soothing instructions as the app; only the
 * voice changes. Uploads to story-audio/test/voices/ and prints URLs.
 */
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const SAMPLE_FR =
  "Bonne nuit, mon petit. Ferme doucement les yeux. Ce soir, Tom s'aventure dans la forêt endormie, et la lune veille sur lui. N'aie pas peur du noir, il est plein de petites lumières.";

const INSTRUCTIONS =
  "Speak like a loving parent reading a bedtime story to their own young child. Warm, tender, and intimate, with a soft smile in the voice. Slow, gentle, soothing pace. Never formal, never like a news reader: cozy and affectionate, as if cuddling the child to sleep.";

// Warmer/storyteller-leaning voices worth comparing.
const DEFAULT_VOICES = ["ballad", "sage", "shimmer", "coral", "vale", "marin"];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function sample(voice: string) {
  try {
    const res = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: SAMPLE_FR,
      instructions: INSTRUCTIONS,
      response_format: "mp3",
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const path = `test/voices/${voice}.mp3`;
    const { error } = await supabase.storage
      .from("story-audio")
      .upload(path, buf, { contentType: "audio/mpeg", upsert: true });
    if (error) throw new Error(error.message);
    const url = supabase.storage.from("story-audio").getPublicUrl(path).data.publicUrl;
    console.log(`✓ ${voice.padEnd(9)} ${url}`);
  } catch (e) {
    console.log(`✗ ${voice.padEnd(9)} ${(e as Error).message}`);
  }
}

async function main() {
  const voices = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_VOICES;
  console.log(`Sample text: "${SAMPLE_FR}"\n`);
  for (const v of voices) await sample(v);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
