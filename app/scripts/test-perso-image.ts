/** Live test of the lazy personalized-illustration path (bypasses the session
 * gate — same internals as ensureCustomStoryImage). */
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { generateImage } from "@/lib/ai";
import { personalizedImagePrompt } from "@/lib/ai/stylePrompts";
// db/customStories.ts is server-only too — read the row directly here.
async function selectCustomStoryImageInputs(storyId: string) {
  const [row] = await db
    .select({
      heroImageUrl: stories.heroImageUrl,
      generationMetadata: stories.generationMetadata,
    })
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);
  if (!row) return null;
  const meta = row.generationMetadata as {
    params?: { style?: string; heroName?: string; theme?: string; place?: string; friend?: string };
    imagePrompt?: string;
  } | null;
  const p = meta?.params;
  if (!p) return null;
  return {
    heroImageUrl: row.heroImageUrl,
    style: (p.style ?? "automatique") as "automatique",
    imagePrompt:
      meta?.imagePrompt ??
      `hero ${p.heroName}, theme ${p.theme}${p.place ? `, set in ${p.place}` : ""}${p.friend ? `, with ${p.friend}` : ""}, night-time bedtime mood`,
  };
}

// storage.ts is `server-only` (unimportable from scripts) — inline the upload.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
async function fetchToBuffer(u: string): Promise<Buffer> {
  if (u.startsWith("data:")) return Buffer.from(u.split(",", 2)[1], "base64");
  const r = await fetch(u);
  return Buffer.from(await r.arrayBuffer());
}
async function uploadAsset(bucket: string, path: string, data: Buffer, contentType: string) {
  const { error } = await supabase.storage.from(bucket).upload(path, data, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const id = process.argv[2] ?? "PS-FR-e9e040b1d2954eef9157";

async function main() {
  const inputs = await selectCustomStoryImageInputs(id);
  if (!inputs) throw new Error("story not found");
  console.log("style:", inputs.style);
  console.log("prompt:", inputs.imagePrompt.slice(0, 140));
  if (inputs.heroImageUrl) {
    console.log("ALREADY CACHED:", inputs.heroImageUrl);
    process.exit(0);
  }
  const t0 = Date.now();
  const out = await generateImage("personalized", {
    prompt: personalizedImagePrompt(inputs.style, inputs.imagePrompt),
    size: "1024x1024",
  });
  const bytes = await fetchToBuffer(out.imageUrl);
  const url = await uploadAsset("story-images", `${id}/hero.png`, bytes, "image/png");
  await db.update(stories).set({ heroImageUrl: url, updatedAt: new Date() }).where(eq(stories.id, id));
  console.log(`GENERATED in ${(Date.now() - t0) / 1000}s:`, url);
  process.exit(0);
}
main().catch((e) => { console.error("FAILED:", (e as Error).message); process.exit(1); });
