/**
 * Story-creation option catalogue, shared by the /creer wizard (client) and
 * generateStoryAction (server prompt composition). No "use client": both
 * sides import real values from here.
 */

export type StoryOpt = { id: string; fr: string; en: string };

export function storyOptLabel(opt: StoryOpt, locale: string): string {
  return locale === "en" ? opt.en : opt.fr;
}

/**
 * Hero kind. Free plan: child heroes only (boy/girl), per the brief; animal
 * and adult heroes are paid perks. Enforced in the UI AND server-side.
 */
export const HERO_TYPES: (StoryOpt & { free: boolean })[] = [
  { id: "garcon", fr: "Un garçon", en: "A boy", free: true },
  { id: "fille", fr: "Une fille", en: "A girl", free: true },
  { id: "animal", fr: "Un animal", en: "An animal", free: false },
  { id: "adulte", fr: "Un adulte", en: "An adult", free: false },
];

/** Free plan: hero age capped at 12 (13+ heroes are a paid perk). */
export const FREE_HERO_MAX_AGE = 12;

/** Relations for secondary characters ("Léo est... un copain"). */
export const COMPANION_RELATIONS: StoryOpt[] = [
  { id: "copain", fr: "un copain", en: "a friend (boy)" },
  { id: "copine", fr: "une copine", en: "a friend (girl)" },
  { id: "frere", fr: "son frère", en: "their brother" },
  { id: "soeur", fr: "sa sœur", en: "their sister" },
  { id: "papa", fr: "son papa", en: "their dad" },
  { id: "maman", fr: "sa maman", en: "their mum" },
  { id: "grandpere", fr: "son grand-père", en: "their grandpa" },
  { id: "grandmere", fr: "sa grand-mère", en: "their grandma" },
  { id: "cousin", fr: "un cousin", en: "a cousin (boy)" },
  { id: "cousine", fr: "une cousine", en: "a cousin (girl)" },
  { id: "animal", fr: "son animal de compagnie", en: "their pet" },
  { id: "autre", fr: "un proche", en: "someone close" },
];

export const MAX_COMPANIONS = 4;
export const MAX_EXTRA_INFO = 3;

/** Optional skin-tone preference for the illustrations (ids match characterOptions). */
export const STORY_SKIN_TONES: StoryOpt[] = [
  { id: "claire", fr: "Peau claire", en: "Light skin" },
  { id: "mate", fr: "Peau mate", en: "Tan skin" },
  { id: "foncee", fr: "Peau foncée", en: "Dark skin" },
];

export function relationLabel(id: string, locale: string): string {
  const r = COMPANION_RELATIONS.find((x) => x.id === id);
  return r ? storyOptLabel(r, locale) : id;
}

export function heroTypeLabel(id: string | undefined, locale: string): string {
  const h = HERO_TYPES.find((x) => x.id === id);
  return h ? storyOptLabel(h, locale) : "";
}
