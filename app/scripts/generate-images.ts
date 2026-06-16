/**
 * Generate cover illustrations for every library story and every blog article
 * with the OpenAI Images API (gpt-image-1), saving PNGs into /public/img and
 * recording which slugs succeeded in src/data/generated-images.json. The app
 * only renders an image when its slug is in that manifest, so a partial or
 * skipped run degrades gracefully back to the gradient placeholders.
 *
 * Run: `pnpm img:generate`  (reads OPENAI_API_KEY from .env.local)
 * Force re-generation of existing files: `FORCE=1 pnpm img:generate`
 */
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { mockStories } from "@/data/mock-stories";
import { blogArticles } from "@/data/mock-blog";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ROOT = process.cwd();
const STORY_DIR = path.join(ROOT, "public", "img", "stories");
const BLOG_DIR = path.join(ROOT, "public", "img", "blog");
const MANIFEST = path.join(ROOT, "src", "data", "generated-images.json");

const STYLE =
  "Children's storybook illustration, warm and dreamy, soft painterly gouache texture, " +
  "gentle bedtime palette of deep navy blue, soft indigo and mint green with warm candle-like highlights, " +
  "cozy and reassuring mood, whimsical, hand-illustrated. " +
  "A single uninterrupted full-bleed scene with ONE clear focal subject placed in the CENTER of the frame, " +
  "with comfortable empty margins around it so the picture stays well framed when cropped to a square, a portrait card, or a wide banner. " +
  "Do NOT split the image into panels, frames, a diptych, a grid, or side-by-side halves; one cohesive centered picture only. " +
  "No text, no letters, no words, no logos, no borders.";

// Optional: regenerate only specific slugs, e.g. `ONLY=foo,bar pnpm img:generate`.
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",").map((s) => s.trim())) : null;

async function gen(prompt: string, out: string): Promise<boolean> {
  if (fs.existsSync(out) && !process.env.FORCE) {
    console.log("skip (exists):", path.relative(ROOT, out));
    return true;
  }
  const res = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "medium",
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("no image data returned");
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("ok:", path.relative(ROOT, out));
  return true;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing (set it in .env.local)");
  fs.mkdirSync(STORY_DIR, { recursive: true });
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  // When regenerating a subset, start from the existing manifest so the other
  // entries are preserved.
  const done: { stories: string[]; blog: string[] } = ONLY
    ? (() => {
        try {
          return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
        } catch {
          return { stories: [], blog: [] };
        }
      })()
    : { stories: [], blog: [] };
  const add = (list: string[], slug: string) => {
    if (!list.includes(slug)) list.push(slug);
  };

  for (const s of mockStories) {
    if (ONLY && !ONLY.has(s.slug)) continue;
    const prompt =
      `${STYLE} Cover scene for a children's story titled "${s.title}". ` +
      `${s.excerpt} Theme: ${s.theme}. Main character: ${s.character}. ` +
      `Suited to children aged ${s.ageRange}. Portrait-friendly composition with a clear central subject.`;
    try {
      await gen(prompt, path.join(STORY_DIR, `${s.slug}.png`));
      add(done.stories, s.slug);
    } catch (e) {
      console.error("FAIL story", s.slug, ":", e instanceof Error ? e.message : String(e));
    }
  }

  for (const a of blogArticles) {
    if (ONLY && !ONLY.has(a.slug)) continue;
    const prompt =
      `${STYLE} Calm editorial cover illustration for a parenting article titled "${a.title}". ` +
      `Topic: ${a.tag}. Symbolic and reassuring, soft focus, no readable text.`;
    try {
      await gen(prompt, path.join(BLOG_DIR, `${a.slug}.png`));
      add(done.blog, a.slug);
    } catch (e) {
      console.error("FAIL blog", a.slug, ":", e instanceof Error ? e.message : String(e));
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(done, null, 2) + "\n");
  console.log(`\nManifest written: ${done.stories.length} stories, ${done.blog.length} blog images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
