import { ageToRange, type MockStory } from "@/data/mock-stories";

/**
 * "L'histoire de ce soir" (#1) — one deterministic daily story pick per child.
 *
 * Deterministic so it stays the SAME all day for a given child (no reroll on
 * refresh) but rotates every day. The seed is the profile id + calendar date,
 * so two children get different picks and the same child gets a fresh one each
 * evening. Age-matched, and biased toward the child's favourite themes when
 * enough themed stories exist, while still rotating through the catalogue.
 */

/** Local calendar date key (YYYY-MM-DD) in the reader's own timezone. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Tiny stable string hash (FNV-1a, 32-bit) — no crypto needed for a pick. */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Pick tonight's story for a child. Returns null only when the catalogue has
 * no story at all for the child's age range.
 */
export function pickDailyStory(
  args: { profileId: string; age: number; themes: string[] },
  stories: MockStory[],
  date: Date = new Date()
): MockStory | null {
  const range = ageToRange(args.age);
  const ageMatched = stories.filter((s) => s.ageRange === range);
  if (ageMatched.length === 0) return null;

  // Prefer favourite themes, but only if that pool is rich enough to still feel
  // varied night to night; otherwise fall back to the whole age range.
  const themed = ageMatched.filter((s) => args.themes.includes(s.theme));
  const pool = themed.length >= 3 ? themed : ageMatched;

  // Stable order (by slug) so the index maps to the same story every render.
  const ordered = [...pool].sort((a, b) => a.slug.localeCompare(b.slug));
  const seed = hashString(`${args.profileId}:${todayKey(date)}`);
  return ordered[seed % ordered.length];
}
