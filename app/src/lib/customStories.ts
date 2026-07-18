"use client";

import { scopedKey } from "./userScope";
import { TIER_LIMITS, readTier, type Tier } from "./tier";

/**
 * Personalized stories, Phase 1 store (localStorage, per-account scoped) +
 * monthly quota. Phase 2: rows in `stories` (kind=personalized) +
 * server-enforced quota.
 */

export const FREE_CUSTOM_LIMIT = TIER_LIMITS.free.customPerMonth; // free tier, per month

/** @deprecated tier limits now live in lib/tier.ts (TIER_LIMITS). */
export type CustomTier = Tier;

export { readTier };

export function customLimitFor(tier: Tier): number {
  return TIER_LIMITS[tier].customPerMonth;
}

/**
 * Wipe the monthly quota counter for the current account. Exposed for testing
 * (Harry hit the cap on the free test account and needs a clean slate to keep
 * validating the create-story flow).
 */
export function resetQuota(): void {
  try {
    localStorage.removeItem(scopedKey(QUOTA_KEY));
  } catch {
    /* non-fatal */
  }
}

/** One secondary character: "Léo est... un copain". Relation ids live in lib/storyOptions.ts. */
export type StoryCompanion = { name: string; relation: string };

export type CustomStoryParams = {
  heroName: string;
  heroAge: number;
  /** Hero kind (garcon/fille free, animal/adulte paid). See HERO_TYPES. */
  heroType?: string;
  trait: string;
  /**
   * Full description of a SAVED character used as hero (appearance +
   * personality, no length cap). When set, it replaces `trait` in the prompt
   * and the trait input is hidden: all-or-nothing, never a truncated blurb.
   */
  heroDescription?: string;
  theme: string;
  /** Optional finer angle inside the theme (STORY_SUBTHEMES id or free text). */
  subTheme?: string;
  mood: "drole" | "mysterieux" | "touchant" | "palpitant" | "doux";
  language: "fr" | "en";
  /** Legacy composed summary of the companions (kept for old stories + prompt). */
  friend: string;
  place: string;
  fear: string;
  /** Illustration style (#15) — drives the image generation. */
  style: "automatique" | "aquarelle" | "bd" | "anime3d" | "crayons" | "kawaii" | "vif";
  /** Up to MAX_COMPANIONS secondary characters. */
  companions?: StoryCompanion[];
  /** Reading-level override; defaults to heroAge when absent. */
  readingAge?: number;
  /** Up to MAX_EXTRA_INFO free-text sentences to weave into the plot. */
  extraInfo?: string[];
  /** Optional illustration skin-tone preference (STORY_SKIN_TONES id). */
  skinTone?: string;
  /** Optional moral the ending should carry (label text or free sentence). */
  moral?: string;
  /** Title of the previous episode when this story is a sequel. */
  sequelOf?: string;
  /** Id of the previous episode: reused as image reference for consistency. */
  sequelOfId?: string;
};

/**
 * Cache the story's illustration URL on the local copy, so the dashboard and
 * the story page can show the real cover without re-asking the server.
 */
export function setCustomStoryImage(id: string, imageUrl: string): void {
  try {
    localStorage.setItem(
      scopedKey(KEY),
      JSON.stringify(readCustomStories().map((s) => (s.id === id ? { ...s, imageUrl } : s)))
    );
  } catch {
    /* non-fatal */
  }
}

/** Remove a personalized story from the local cache (DB removal is separate). */
export function deleteCustomStory(id: string): void {
  try {
    localStorage.setItem(
      scopedKey(KEY),
      JSON.stringify(readCustomStories().filter((s) => s.id !== id))
    );
  } catch {
    /* non-fatal */
  }
}

export function findCustomStory(id: string): CustomStory | undefined {
  return readCustomStories().find((s) => s.id === id);
}

export type CustomStory = {
  id: string;
  profileId: string | null;
  title: string;
  params: CustomStoryParams;
  body: string[];
  /** Cached illustration (Supabase Storage URL), set after first generation. */
  imageUrl?: string;
  /** Difficult words + child-friendly definitions, when the story has any. */
  glossary?: { word: string; definition: string }[];
  createdAt: string;
};

const KEY = "lunireve:customStories";
const QUOTA_KEY = "lunireve:quota:custom";

export function readCustomStories(): CustomStory[] {
  try {
    return JSON.parse(localStorage.getItem(scopedKey(KEY)) ?? "[]") as CustomStory[];
  } catch {
    return [];
  }
}

export function quotaUsed(): number {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const q = JSON.parse(localStorage.getItem(scopedKey(QUOTA_KEY)) ?? "{}") as {
      month?: string;
      used?: number;
    };
    return q.month === month ? (q.used ?? 0) : 0;
  } catch {
    return 0;
  }
}

function bumpQuota() {
  const month = new Date().toISOString().slice(0, 7);
  try {
    localStorage.setItem(
      scopedKey(QUOTA_KEY),
      JSON.stringify({ month, used: quotaUsed() + 1 })
    );
  } catch {
    /* non-fatal */
  }
}

/**
 * Persist a generated (or stub) story locally and consume one quota unit.
 * Pass `id` to store under the DB-assigned id so the local offline copy and the
 * shareable /histoire-perso/<id> URL line up; omit it for a purely local story.
 */
export function saveCustomStory(
  title: string,
  body: string[],
  params: CustomStoryParams,
  profileId: string | null,
  id?: string,
  glossary?: { word: string; definition: string }[]
): CustomStory {
  const story: CustomStory = {
    id: id ?? crypto.randomUUID(),
    profileId,
    title,
    params,
    body,
    glossary: glossary?.length ? glossary : undefined,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(scopedKey(KEY), JSON.stringify([...readCustomStories(), story]));
  } catch {
    /* non-fatal */
  }
  bumpQuota();
  return story;
}

/**
 * Offline/error fallback: a warm template story built from the params.
 * The real path is the generateStoryAction server action (Claude).
 */
export function buildStubStory(
  params: CustomStoryParams
): { title: string; body: string[] } {
  const { heroName, place, friend, trait, fear } = params;
  const where = place || "un endroit que personne n'avait jamais visité";
  const ami = friend || "une luciole nommée Lumi";

  return {
    title: `${heroName} et la nuit aux mille étoiles`,
    body: [
      `Ce soir-là, ${heroName} n'arrivait pas à dormir. Par la fenêtre, les étoiles semblaient plus proches que d'habitude, comme si elles attendaient quelque chose. Ou quelqu'un.`,
      `${heroName} enfila ses chaussons et, sans faire craquer le parquet, se glissa jusqu'à ${where}. ${trait ? `Il faut dire que ${heroName} avait un secret : ${trait.toLowerCase()}.` : `L'air sentait la menthe et les histoires qu'on n'a pas encore racontées.`}`,
      `C'est là qu'apparut ${ami}. « Je t'attendais », dit une petite voix. « Cette nuit, les étoiles ont perdu leur chemin. Toi seul peux les aider à rentrer chez elles. »`,
      fear
        ? `${heroName} sentit son cœur se serrer, ${fear.toLowerCase()}, c'était justement ce qui lui faisait le plus peur. Mais une étoile perdue, ça ne se laisse pas tomber. ${heroName} respira un grand coup et fit le premier pas.`
        : `${heroName} n'hésita pas une seconde. Une étoile perdue, ça ne se laisse pas tomber.`,
      `Ce qui se passa ensuite, peu de gens le savent. On raconte que cette nuit-là, quelqu'un a recousu le ciel avec du fil d'argent. On raconte aussi que les étoiles, pour dire merci, ont appris à ${heroName} le chemin des plus beaux rêves.`,
      `Et si tu regardes bien le ciel ce soir, tu verras peut-être une étoile briller un peu plus fort que les autres. C'est elle qui veille sur ${heroName}. Bonne nuit.`,
    ],
  };
}
