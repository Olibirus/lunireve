"use client";

/**
 * Personalized stories, Phase 1 store (localStorage) + quota.
 * Phase 2: rows in `stories` (kind=personalized) + server-enforced quota.
 */

export const FREE_CUSTOM_LIMIT = 3; // per month, free tier

export type CustomStoryParams = {
  heroName: string;
  heroAge: number;
  trait: string;
  theme: string;
  mood: "drole" | "mysterieux" | "touchant" | "palpitant" | "doux";
  length: "short" | "medium" | "long";
  language: "fr" | "en";
  friend: string;
  place: string;
  fear: string;
  /** Illustration style (#15) — drives the future image generation. */
  style: "automatique" | "aquarelle" | "bd" | "anime3d" | "crayons" | "kawaii";
};

export function findCustomStory(id: string): CustomStory | undefined {
  return readCustomStories().find((s) => s.id === id);
}

export type CustomStory = {
  id: string;
  profileId: string | null;
  title: string;
  params: CustomStoryParams;
  body: string[];
  createdAt: string;
};

const KEY = "lunireve:customStories";
const QUOTA_KEY = "lunireve:quota:custom";

export function readCustomStories(): CustomStory[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as CustomStory[];
  } catch {
    return [];
  }
}

export function quotaUsed(): number {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const q = JSON.parse(localStorage.getItem(QUOTA_KEY) ?? "{}") as {
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
      QUOTA_KEY,
      JSON.stringify({ month, used: quotaUsed() + 1 })
    );
  } catch {
    /* non-fatal */
  }
}

/** Persist a generated (or stub) story locally and consume one quota unit. */
export function saveCustomStory(
  title: string,
  body: string[],
  params: CustomStoryParams,
  profileId: string | null
): CustomStory {
  const story: CustomStory = {
    id: crypto.randomUUID(),
    profileId,
    title,
    params,
    body,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([...readCustomStories(), story]));
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
