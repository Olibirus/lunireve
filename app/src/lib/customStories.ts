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

/**
 * Re-key a local story onto the id the DB assigned it.
 *
 * Stories created while the database was unreachable (paused project, network
 * blip) fall back to a random local id, and everything gated on a real row,
 * illustration, audio, sharing, silently never happens. Promoting the story
 * later hands it a real `PS-` id, and this swaps the local copy over so the
 * device stops pointing at the orphan.
 */
export function replaceCustomStoryId(oldId: string, newId: string): void {
  try {
    localStorage.setItem(
      scopedKey(KEY),
      JSON.stringify(
        readCustomStories().map((s) => (s.id === oldId ? { ...s, id: newId } : s))
      )
    );
  } catch {
    /* non-fatal */
  }
}

/**
 * Hand a deleted child's stories back to the parent.
 *
 * Deleting a profile must never destroy the stories written for that child:
 * they are family keepsakes, and they cost the account real generation quota.
 * They move to the parent's shelf instead (profileId = null), which is also
 * where an unattributed story already lives.
 */
export function reassignStoriesToParent(profileId: string): number {
  const stories = readCustomStories();
  const moved = stories.filter((s) => s.profileId === profileId).length;
  if (!moved) return 0;
  try {
    localStorage.setItem(
      scopedKey(KEY),
      JSON.stringify(
        stories.map((s) => (s.profileId === profileId ? { ...s, profileId: null } : s))
      )
    );
  } catch {
    /* non-fatal */
  }
  return moved;
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

/**
 * Start of the CURRENT billing period, as a YYYY-MM-DD stamp.
 *
 * Benefits reset on the renewal day, not on the 1st of the calendar month: a
 * subscriber who paid on the 12th gets a fresh allowance every 12th. The
 * anchor is the billing day stored by the subscription (see setBillingAnchor);
 * without one (free accounts, pre-Stripe) it falls back to the calendar month.
 */
export function currentPeriodStart(now = new Date()): string {
  const anchorDay = readBillingAnchorDay();
  if (!anchorDay) return `${now.toISOString().slice(0, 7)}-01`;
  // Clamp to the last day of the month so the 31st still renews in February.
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  let year = now.getFullYear();
  let month = now.getMonth();
  if (now.getDate() < Math.min(anchorDay, daysInMonth(year, month))) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }
  const day = Math.min(anchorDay, daysInMonth(year, month));
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const BILLING_KEY = "lunireve:billingAnchor";

/** Day of the month the subscription renews on (1-31), or null if unknown. */
function readBillingAnchorDay(): number | null {
  try {
    const raw = localStorage.getItem(scopedKey(BILLING_KEY));
    if (!raw) return null;
    const day = new Date(raw).getDate();
    return Number.isFinite(day) && day >= 1 && day <= 31 ? day : null;
  } catch {
    return null;
  }
}

/**
 * Record the date a payment/renewal was accepted. Quotas reset from this day
 * on, every month. Called when a subscription starts or renews (Stripe webhook
 * in V2; the subscription page calls it today).
 */
export function setBillingAnchor(paidAt: Date | string = new Date()): void {
  try {
    const iso = typeof paidAt === "string" ? paidAt : paidAt.toISOString();
    localStorage.setItem(scopedKey(BILLING_KEY), iso);
  } catch {
    /* non-fatal */
  }
}

/**
 * Anchor the cycle on first sight of a paid plan, WITHOUT moving it afterwards
 * (re-anchoring on every page view would hand out a fresh allowance each time).
 */
export function ensureBillingAnchor(paidAt: Date | string = new Date()): void {
  try {
    if (localStorage.getItem(scopedKey(BILLING_KEY))) return;
  } catch {
    return;
  }
  setBillingAnchor(paidAt);
}

export function quotaUsed(): number {
  const period = currentPeriodStart();
  try {
    const q = JSON.parse(localStorage.getItem(scopedKey(QUOTA_KEY)) ?? "{}") as {
      month?: string;
      period?: string;
      used?: number;
    };
    // `month` is the legacy calendar-month field: honored until the first
    // reset so nobody's counter jumps when this ships.
    const stamp = q.period ?? q.month;
    return stamp === period ? (q.used ?? 0) : 0;
  } catch {
    return 0;
  }
}

function bumpQuota() {
  const period = currentPeriodStart();
  try {
    localStorage.setItem(
      scopedKey(QUOTA_KEY),
      JSON.stringify({ period, used: quotaUsed() + 1 })
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
