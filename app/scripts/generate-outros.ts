/**
 * One-shot: render the "thank you for listening" outro tracks played after
 * every story narration, in both site languages, with the same warm narrator
 * voice as the stories. Files land in public/audio/ and are committed, so
 * playback costs nothing at runtime.
 *
 *   npx dotenv -e .env.local -- npx tsx scripts/generate-outros.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateSpeech } from "@/lib/ai";

const OUTROS = {
  fr: "Merci d'avoir écouté notre histoire. Nous espérons qu'elle t'a plu. À très bientôt pour une nouvelle histoire... Bonne nuit, et fais de beaux rêves.",
  en: "Thank you for listening to our story. We hope you enjoyed it. See you very soon for the next story... Good night, and sweet dreams.",
} as const;

async function main() {
  const dir = join(process.cwd(), "public", "audio");
  mkdirSync(dir, { recursive: true });
  for (const [lang, text] of Object.entries(OUTROS) as ["fr" | "en", string][]) {
    console.log(`Rendering outro (${lang})...`);
    const res = await generateSpeech("personalized", {
      text,
      language: lang,
      voiceType: "female",
      speed: 0.9,
    });
    const file = join(dir, `outro-${lang}.mp3`);
    writeFileSync(file, res.audio);
    console.log(`  -> ${file} (${(res.audio.length / 1024).toFixed(0)} KB, ${res.model})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
