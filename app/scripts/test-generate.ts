/**
 * Live end-to-end generation test (no DB writes, no app needed).
 *
 *   pnpm test:generate            # full chain, age 6
 *   pnpm test:generate 10         # full chain, age 10
 *   pnpm test:generate 6 text     # text only (no image/audio — cheap length tuning)
 *
 * Runs the real provider chain against sample personalized-story requirements
 * and prints the result so we can judge quality before automating:
 *   text (Claude) -> illustration (OpenAI gpt-image-1, by style) -> narration
 *   (OpenAI TTS). Image + audio are uploaded to the Supabase test/ folders so
 *   you can open the URLs and review.
 */
import { createClient } from "@supabase/supabase-js";
import {
  generateStoryText,
  generateImage,
  generateSpeech,
  WORD_RANGE_BY_AGE,
  type AgeRange,
} from "@/lib/ai";

// ---- Sample requirements (edit to try other combinations) ----------------
// Override the hero's age from the CLI: `pnpm test:generate 10`
const REQ = {
  heroName: "Tom",
  heroAge: Number(process.argv[2]) || 6,
  trait: "curieux",
  theme: "courage",
  mood: "doux" as "drole" | "mysterieux" | "touchant" | "palpitant" | "doux",
  language: "fr" as "fr" | "en",
  friend: "Lila la renarde",
  place: "une forêt endormie",
  fear: "le noir",
  style: "aquarelle" as
    | "automatique"
    | "aquarelle"
    | "bd"
    | "anime3d"
    | "crayons"
    | "kawaii",
};

const MOOD_FR = {
  drole: "drôle et légère",
  mysterieux: "mystérieuse et intrigante",
  touchant: "touchante et tendre",
  palpitant: "palpitante, pleine de rebondissements",
  doux: "douce et apaisante, parfaite pour s'endormir",
};
// Map the UI illustration style to an image-model prompt prefix.
const STYLE_PROMPT: Record<string, string> = {
  automatique: "warm, soft children's book illustration",
  aquarelle: "soft watercolor children's book illustration, gentle washes",
  bd: "clean comic-book / bande dessinée style, bold outlines, flat colors",
  anime3d: "cute 3D animated film style, soft lighting, Pixar-like",
  crayons: "colored-pencil crayon children's illustration, textured strokes",
  kawaii: "kawaii chibi children's illustration, big eyes, pastel palette",
};
const ageToRange = (a: number) =>
  a <= 2 ? "1-2" : a <= 4 ? "3-4" : a <= 6 ? "5-6" : a <= 8 ? "7-8" : a <= 10 ? "9-10" : "11-12";
const clean = (t: string) => t.replace(/\s—\s/g, ", ").replace(/—/g, "-");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function toBuffer(u: string): Promise<Buffer> {
  if (u.startsWith("data:")) return Buffer.from(u.split(",", 2)[1], "base64");
  const r = await fetch(u);
  return Buffer.from(await r.arrayBuffer());
}
async function upload(bucket: string, path: string, data: Buffer, type: string) {
  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    contentType: type,
    upsert: true,
  });
  if (error) throw new Error(`${bucket}/${path}: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function main() {
  const stamp = Date.now();
  const t0 = Date.now();

  // 1) Text (Claude)
  const prompt = [
    `Écris une histoire pour enfant dont le héros est ${REQ.heroName}, ${REQ.heroAge} ans.`,
    `Particularité du héros : ${REQ.trait}.`,
    `Thème : ${REQ.theme}. Ambiance : ${MOOD_FR[REQ.mood]}.`,
    `Un personnage secondaire apparaît : ${REQ.friend}.`,
    `L'histoire se déroule (au moins en partie) ici : ${REQ.place}.`,
    `Le héros surmonte progressivement cette peur : ${REQ.fear}. Avec douceur, jamais effrayant.`,
    "Termine sur une note apaisante adaptée au coucher.",
    "N'utilise jamais de tiret cadratin dans le texte.",
  ].join("\n");

  const ageRange = ageToRange(REQ.heroAge) as AgeRange;
  const story = await generateStoryText({
    language: REQ.language,
    ageRange,
    prompt,
    characters: [{ name: REQ.heroName, description: `héros, ${REQ.heroAge} ans, ${REQ.trait}` }],
    // Length + moral are age-driven inside the provider (WORD_RANGE_BY_AGE).
  });
  const body = (story.scenes.length
    ? story.scenes.map((s) => s.text)
    : story.fullText.split("\n\n")
  )
    .map(clean)
    .filter(Boolean);
  const words = body.join(" ").split(/\s+/).filter(Boolean).length;
  const tText = Date.now();

  console.log("\n===== TEXT (Claude) =====");
  console.log("Title:", clean(story.title));
  console.log("Model:", story.model);
  const range = WORD_RANGE_BY_AGE[ageRange];
  console.log(`Words: ${words}  (age ${ageRange}: ${range.min}-${range.max}, target ${range.target})  ~${Math.max(2, Math.round(words / 140))} min reading`);
  console.log(`Scenes: ${story.scenes.length}  (in range: ${words >= range.min && words <= range.max ? "YES" : "NO"})`);
  console.log("\n--- Story ---\n" + body.join("\n\n"));

  // Text-only mode: skip the paid image/audio steps while tuning length.
  if (process.argv[3] === "text") {
    console.log(`\n===== TIMING =====\ntext ${(tText - t0) / 1000}s (text-only)`);
    return;
  }

  // 2) Image (OpenAI gpt-image-1) in the requested style
  const scenePrompt = story.scenes[0]?.imagePrompt || `${REQ.theme}, ${REQ.place}`;
  const imagePrompt = `${STYLE_PROMPT[REQ.style]}. Scene: ${scenePrompt}. Children's storybook, warm palette, no text, no letters.`;
  const img = await generateImage("personalized", { prompt: imagePrompt, size: "1024x1024" });
  const imageUrl = await upload("story-images", `test/${stamp}.png`, await toBuffer(img.imageUrl), "image/png");
  const tImg = Date.now();

  // 3) Audio (OpenAI TTS). Cap to TTS char limit for the sample.
  const narration = body.join("\n\n").slice(0, 3800);
  const speech = await generateSpeech("personalized", {
    text: narration,
    language: REQ.language,
    speed: REQ.mood === "doux" ? 0.9 : 0.95,
  });
  const audioUrl = await upload("story-audio", `test/${stamp}.mp3`, speech.audio, speech.mimeType);
  const tAudio = Date.now();

  console.log("\n===== MEDIA =====");
  console.log(`Image (${REQ.style}, ${img.model}):`, imageUrl);
  console.log(`Audio (${speech.model}, ${narration.length} chars):`, audioUrl);
  console.log("\n===== TIMING =====");
  console.log(`text ${(tText - t0) / 1000}s  image ${(tImg - tText) / 1000}s  audio ${(tAudio - tImg) / 1000}s  total ${(tAudio - t0) / 1000}s`);
}

main().catch((e) => {
  console.error("\nTEST FAILED:", e);
  process.exit(1);
});
