import {
  mockStories,
  durationBucket,
  AGE_RANGES,
  type MockStory,
  type Genre,
  type AgeRange,
  type DurationBucket,
} from "@/data/mock-stories";

/**
 * Story filtering for funnel pages. Mirrors the WHERE clause the Drizzle
 * query will use in Phase 2 — keep the field names aligned with schema.ts.
 */
export type StoryFilters = {
  genre?: Genre;
  age?: AgeRange;
  theme?: string;
  character?: string;
  duration?: DurationBucket;
  audio?: boolean;
  /** Exact tag match (from story-page hashtags). Precise, not fuzzy search. */
  tag?: string;
};

export function applyFilters(filters: StoryFilters): MockStory[] {
  return mockStories.filter((s) => {
    if (filters.genre && s.genre !== filters.genre) return false;
    if (filters.age && s.ageRange !== filters.age) return false;
    if (filters.theme && s.theme !== filters.theme) return false;
    if (filters.character && s.character !== filters.character) return false;
    if (filters.duration && durationBucket(s.readingMinutes) !== filters.duration)
      return false;
    if (filters.audio && !s.hasAudio) return false;
    if (
      filters.tag &&
      !s.tags.some((tg) => tg.toLowerCase() === filters.tag!.toLowerCase())
    )
      return false;
    return true;
  });
}

/**
 * Themes for the chip rails. Library themes first, then a broader set so
 * families can explore (and create) beyond what's already published. Picking
 * a theme with no library match surfaces the "create a story" CTA.
 */
const STORY_THEMES = [...new Set(mockStories.map((s) => s.theme))];
/**
 * Themes answer "what is this about in the child's life", genres answer "what
 * kind of story is it". They must never share a word: the old list carried
 * aventure / fantastique / humour / decouverte, which simply repeated the
 * aventure / fantastique / rigolote / educative genres and made the two filter
 * rails feel like the same question asked twice. Also dropped: voyage (folded
 * into aventure the genre) and sport (no real bedtime demand). Their i18n
 * labels are kept so either can come back without touching messages.
 */
const EXTRA_THEMES = [
  "famille",
  "courage",
  "ecole",
  "animaux",
  "mer",
  "espace",
  "noel",
  "anniversaire",
  "saisons",
];
export const THEMES = [...new Set([...STORY_THEMES, ...EXTRA_THEMES])];

/**
 * Two-level filter rails: the flat 25-character / 18-theme chip walls were
 * overwhelming, so chips are grouped into a handful of categories. Clicking a
 * category opens its sub-chips underneath (query-param driven, so the page
 * stays server-rendered and crawlable). Labels live in messages under
 * `filterCats.*`.
 */
/**
 * A character chip has to be a category a parent would browse, not a prop that
 * happened to star in one story. The "insolites" group (gateau, phare) and the
 * one-off marchand were exactly that; reine collapsed into princesse, and
 * grand-mere is a family relationship the `famille` theme already covers.
 * chien / souris / groupe-enfants are added because they carry real demand.
 */
export const CHARACTER_GROUPS: { id: string; members: string[] }[] = [
  { id: "enfants", members: ["enfant-fille", "enfant-garcon", "groupe-enfants"] },
  {
    id: "animaux",
    members: ["renard", "loup", "ours", "lapin", "chat", "chien", "souris", "hibou", "lion", "dinosaure"],
  },
  { id: "creatures", members: ["dragon", "licorne", "fee", "sirene", "sorciere"] },
  { id: "heros", members: ["princesse", "chevalier", "pirate", "astronaute", "robot"] },
];

export const THEME_GROUPS: { id: string; members: string[] }[] = [
  { id: "liens", members: ["emotions", "amitie", "famille", "courage"] },
  { id: "nature", members: ["animaux", "nature", "mer", "espace"] },
  { id: "quotidien", members: ["ecole", "noel", "anniversaire", "saisons"] },
];

/** The group a filter value belongs to, so an active filter auto-opens it. */
export function groupOf(
  groups: { id: string; members: string[] }[],
  value: string | undefined
): string | undefined {
  if (!value) return undefined;
  return groups.find((g) => g.members.includes(value))?.id;
}

/**
 * Library sort (#9), now directional: every criterion is a toggle. First
 * click applies the natural direction, second click reverses it (most recent
 * <-> oldest, best rated <-> lowest, most liked <-> least, short <-> long).
 */
export type StorySortKey = "newest" | "rating" | "liked" | "duration";
export type StorySortDir = "desc" | "asc";
export type StorySort = { key: StorySortKey; dir: StorySortDir };

/** Natural first-click direction per criterion. */
export const SORT_DEFAULT_DIR: Record<StorySortKey, StorySortDir> = {
  newest: "desc", // most recent first
  rating: "desc", // best rated first
  liked: "desc", // most liked first
  duration: "asc", // shortest first
};

export function sortStories(stories: MockStory[], sort: StorySort): MockStory[] {
  const arr = [...stories];
  const flip = (n: number) => (sort.dir === "asc" ? -n : n);
  switch (sort.key) {
    case "rating":
      // Ties broken by vote count (more votes = more trust).
      return arr.sort((a, b) => flip(b.rating - a.rating || b.ratingCount - a.ratingCount));
    case "liked":
      // Most liked = most favorites (real aggregate, 0 until users favorite).
      return arr.sort((a, b) => flip(b.favoritesCount - a.favoritesCount || b.rating - a.rating));
    case "duration":
      // "asc" = shortest first (the natural default for this criterion).
      return arr.sort((a, b) => flip(b.readingMinutes - a.readingMinutes));
    case "newest":
    default:
      // Sort on publishedAt, not array position: the catalogue is stored
      // oldest-first, so the old "return arr as-is" actually showed the OLDEST
      // story under "plus récentes".
      return arr.sort((a, b) => flip(b.publishedAt.localeCompare(a.publishedAt)));
  }
}

/** Read `sort` + `dir` query params, falling back to the default order. */
export function sortFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): StorySort {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const s = one(sp.sort);
  const key: StorySortKey =
    s === "rating" || s === "liked" || s === "duration" || s === "newest" ? s : "newest";
  const d = one(sp.dir);
  const dir: StorySortDir = d === "asc" || d === "desc" ? d : SORT_DEFAULT_DIR[key];
  return { key, dir };
}

/** Parse Next.js searchParams into typed filters, ignoring junk values. */
export function filtersFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): StoryFilters {
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const f: StoryFilters = {};
  const age = one(sp.age);
  if (age && (AGE_RANGES as readonly string[]).includes(age)) f.age = age as AgeRange;
  const genre = one(sp.genre);
  if (genre) f.genre = genre as Genre;
  const theme = one(sp.theme);
  if (theme) f.theme = theme;
  const character = one(sp.character);
  if (character) f.character = character;
  const duration = one(sp.duration);
  if (duration === "short" || duration === "medium" || duration === "long")
    f.duration = duration;
  if (one(sp.audio) === "1") f.audio = true;
  const tag = one(sp.tag);
  if (tag) f.tag = tag;
  return f;
}
