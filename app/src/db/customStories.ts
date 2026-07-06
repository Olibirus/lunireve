import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { stories } from "./schema";
import { ageToRange } from "@/data/mock-stories";
import type { CustomStory, CustomStoryParams } from "@/lib/customStories";

/**
 * DB-backed personalized stories — the localStorage -> Supabase swap.
 *
 * Personalized text stories used to live only in the browser, so a shared
 * /histoire-perso/<id> link only worked on the device that created it. Storing
 * them as `stories` rows (type = text_story, owner = the creator) makes those
 * links resolve anywhere, which is the whole point of sharing one.
 *
 * The UI contract stays the `CustomStory` shape from lib/customStories: we keep
 * the original params + paragraph array in generationMetadata and reconstruct
 * it on read, so Session B can swap its store for these calls without reshaping
 * the page. Chapters hold the flattened text so the lazy TTS path can narrate a
 * personalized story straight from the row.
 */

const PERSONALIZED_GENRE = "personnalise";

type CustomStoryMetadata = {
  params: CustomStoryParams;
  body: string[];
  profileId: string | null;
  glossary?: { word: string; definition: string }[];
  model?: string;
  /** Scene-1 visual description from the text model — feeds lazy image gen. */
  imagePrompt?: string;
};

// Combining diacritical marks (U+0300–U+036F) left behind by NFD decomposition.
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Reconstruct the UI-facing CustomStory from a stored row. */
function rowToCustomStory(row: typeof stories.$inferSelect): CustomStory | null {
  const meta = row.generationMetadata as CustomStoryMetadata | null;
  if (!meta?.params || !Array.isArray(meta.body)) return null;
  return {
    id: row.id,
    profileId: meta.profileId ?? null,
    title: row.title,
    params: meta.params,
    body: meta.body,
    glossary: meta.glossary?.length ? meta.glossary : undefined,
    imageUrl: row.heroImageUrl ?? undefined,
    createdAt: (row.createdAt ?? new Date()).toISOString(),
  };
}

/**
 * Insert a personalized story and return its public id (used in the share URL).
 * `ownerUserId` is null for temp/anonymous accounts — the link still resolves;
 * it just is not attributed to a Supabase user.
 */
export async function insertCustomStory(input: {
  title: string;
  body: string[];
  params: CustomStoryParams;
  profileId: string | null;
  ownerUserId: string | null;
  glossary?: { word: string; definition: string }[];
  model?: string;
  imagePrompt?: string;
}): Promise<string> {
  const { title, body, params, profileId, ownerUserId } = input;

  const raw = crypto.randomUUID().replace(/-/g, "");
  const base = raw.slice(0, 20);
  const lang = params.language;
  const id = `PS-${lang.toUpperCase()}-${base}`;
  const slug = `${slugify(title) || "histoire"}-${base.slice(0, 8)}`;
  const wordCount = body.join(" ").split(/\s+/).filter(Boolean).length;

  const metadata: CustomStoryMetadata = {
    params,
    body,
    profileId,
    glossary: input.glossary?.length ? input.glossary : undefined,
    model: input.model,
    imagePrompt: input.imagePrompt,
  };

  await db.insert(stories).values({
    id,
    baseId: base,
    language: lang,
    type: "text_story",
    status: "published",
    title,
    slug,
    ageRange: ageToRange(params.heroAge),
    genre: PERSONALIZED_GENRE,
    themes: [params.theme],
    wordCount,
    // Single chapter holding the full narration, so the lazy TTS path works.
    chapters: [{ title, content: body.join("\n\n") }],
    ownerUserId,
    generationMetadata: metadata,
    publishedAt: new Date(),
  });

  return id;
}

/** Fetch one personalized story by id (public — powers the shareable link). */
export async function selectCustomStory(id: string): Promise<CustomStory | null> {
  const [row] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, id), eq(stories.type, "text_story")))
    .limit(1);
  return row ? rowToCustomStory(row) : null;
}

/** List a user's personalized stories, newest first. */
export async function selectCustomStoriesByUser(
  userId: string
): Promise<CustomStory[]> {
  const rows = await db
    .select()
    .from(stories)
    .where(and(eq(stories.ownerUserId, userId), eq(stories.type, "text_story")))
    .orderBy(desc(stories.createdAt));
  return rows.map(rowToCustomStory).filter((s): s is CustomStory => s !== null);
}

/** What the lazy illustration path needs: cached URL + generation inputs. */
export async function selectCustomStoryImageInputs(id: string): Promise<{
  heroImageUrl: string | null;
  style: CustomStoryParams["style"];
  imagePrompt: string;
} | null> {
  const [row] = await db
    .select({
      heroImageUrl: stories.heroImageUrl,
      generationMetadata: stories.generationMetadata,
      title: stories.title,
    })
    .from(stories)
    .where(and(eq(stories.id, id), eq(stories.type, "text_story")))
    .limit(1);
  if (!row) return null;
  const meta = row.generationMetadata as CustomStoryMetadata | null;
  if (!meta?.params) return null;
  const p = meta.params;
  return {
    heroImageUrl: row.heroImageUrl,
    style: p.style,
    // Older rows predate stored imagePrompt — rebuild a scene from the params.
    imagePrompt:
      meta.imagePrompt ??
      `hero ${p.heroName}, theme ${p.theme}${p.place ? `, set in ${p.place}` : ""}${p.friend ? `, with ${p.friend}` : ""}, night-time bedtime mood`,
  };
}
