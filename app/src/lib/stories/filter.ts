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
    return true;
  });
}

/** Themes present in the library (slug list drives chip rails + i18n keys). */
export const THEMES = [...new Set(mockStories.map((s) => s.theme))];

/** Library sort options (#9). "liked" reads the real favoritesCount aggregate. */
export type StorySort = "newest" | "rating" | "liked" | "shortest";

export function sortStories(stories: MockStory[], sort: StorySort): MockStory[] {
  const arr = [...stories];
  switch (sort) {
    case "rating":
      // Best rating first; ties broken by vote count (more votes = more trust).
      return arr.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
    case "liked":
      // Most liked = most favorites (real aggregate, 0 until users favorite).
      return arr.sort((a, b) => b.favoritesCount - a.favoritesCount || b.rating - a.rating);
    case "shortest":
      return arr.sort((a, b) => a.readingMinutes - b.readingMinutes);
    case "newest":
    default:
      return arr;
  }
}

/** Read the `sort` query param, falling back to the default library order. */
export function sortFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): StorySort {
  const s = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  if (s === "rating" || s === "liked" || s === "shortest") return s;
  return "newest";
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
  return f;
}
