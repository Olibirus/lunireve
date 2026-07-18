"use client";

import type { FoxColor } from "@/components/brand/FoxCloud";
import { scopedKey } from "./userScope";
import { tierLimits } from "./tier";

/**
 * Child profiles — Phase 1 store (localStorage, client only).
 *
 * Batch 9+ swaps this module's internals for Supabase queries against the
 * `child_profiles` table; the function signatures stay identical so the UI
 * doesn't change. Per-tier profile cap (free 1 / plus 3 / max 50) enforced
 * here AND server-side later. Storage is namespaced per account.
 */

/** Free tier cap, kept for copy that references "the free plan". */
export const FREE_PROFILE_LIMIT = 1;

/** Max profiles allowed for the current account's tier. */
export function profileLimit(): number {
  return tierLimits().profiles;
}

export type ChildProfile = {
  id: string;
  name: string;
  age: number; // 3–11
  avatar: FoxColor;
  language: "fr" | "en" | "both";
  themes: string[]; // theme slugs
  maxDuration: "none" | "short" | "medium" | "long";
  streak: number;
  lastReadDate: string | null; // ISO date (day precision) of last completed read
  createdAt: string;
  /**
   * ISO date the age was last SET (profile creation, or a manual edit by the
   * parent). Anniversary reference for the yearly auto-bump below; absent on
   * old profiles, where createdAt takes over. DB mirror: child_profiles
   * carries the same intent via birth_year.
   */
  ageSetAt?: string;
};

const KEY = "lunireve:profiles";
const ACTIVE_KEY = "lunireve:activeProfile";

/** Auto-bump ceiling: profiles stay inside the site's 1-12 age taxonomy. */
const MAX_PROFILE_AGE = 12;

/** Full calendar years elapsed since `iso` (anniversary-exact, not /365). */
function fullYearsSince(iso: string): number {
  const from = new Date(iso);
  if (Number.isNaN(from.getTime())) return 0;
  const now = new Date();
  let years = now.getFullYear() - from.getFullYear();
  const anniversary = new Date(from);
  anniversary.setFullYear(from.getFullYear() + years);
  if (anniversary.getTime() > now.getTime()) years -= 1;
  return Math.max(0, years);
}

/**
 * Children grow up on their own: the age advances by one every year on the
 * anniversary of the date it was last set. A manual edit by the parent always
 * wins and restarts the clock (see updateProfile). Applied on read and
 * persisted, so every consumer (dashboard, child bubble, story creation
 * defaults, preferences) sees the current age with no scheduler.
 */
function withCurrentAges(profiles: ChildProfile[]): {
  profiles: ChildProfile[];
  changed: boolean;
} {
  let changed = false;
  const next = profiles.map((p) => {
    const base = p.ageSetAt ?? p.createdAt;
    const years = fullYearsSince(base);
    if (years < 1 || p.age >= MAX_PROFILE_AGE) return p;
    changed = true;
    const anniversary = new Date(base);
    anniversary.setFullYear(anniversary.getFullYear() + years);
    return {
      ...p,
      age: Math.min(p.age + years, MAX_PROFILE_AGE),
      ageSetAt: anniversary.toISOString(),
    };
  });
  return { profiles: next, changed };
}

export function readProfiles(): ChildProfile[] {
  try {
    const raw = JSON.parse(localStorage.getItem(scopedKey(KEY)) ?? "[]") as ChildProfile[];
    const { profiles, changed } = withCurrentAges(raw);
    if (changed) write(profiles);
    return profiles;
  } catch {
    return [];
  }
}

function write(profiles: ChildProfile[]) {
  try {
    localStorage.setItem(scopedKey(KEY), JSON.stringify(profiles));
  } catch {
    /* non-fatal */
  }
}

export function createProfile(
  data: Omit<ChildProfile, "id" | "streak" | "lastReadDate" | "createdAt">
): ChildProfile | null {
  const profiles = readProfiles();
  if (profiles.length >= profileLimit()) return null;
  const now = new Date().toISOString();
  const profile: ChildProfile = {
    ...data,
    id: crypto.randomUUID(),
    streak: 0,
    lastReadDate: null,
    createdAt: now,
    ageSetAt: now,
  };
  write([...profiles, profile]);
  return profile;
}

export function updateProfile(id: string, patch: Partial<ChildProfile>) {
  write(
    readProfiles().map((p) => {
      if (p.id !== id) return p;
      // A manual age edit is the parent's word: it overrides the auto-bump
      // and restarts the yearly clock from today.
      const ageChanged = typeof patch.age === "number" && patch.age !== p.age;
      return { ...p, ...patch, ...(ageChanged ? { ageSetAt: new Date().toISOString() } : {}) };
    })
  );
}

export function deleteProfile(id: string) {
  write(readProfiles().filter((p) => p.id !== id));
  if (getActiveProfileId() === id) clearActiveProfile();
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(scopedKey(ACTIVE_KEY));
}

export function getActiveProfile(): ChildProfile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return readProfiles().find((p) => p.id === id) ?? null;
}

export function setActiveProfile(id: string) {
  localStorage.setItem(scopedKey(ACTIVE_KEY), id);
}

export function clearActiveProfile() {
  localStorage.removeItem(scopedKey(ACTIVE_KEY));
}

/**
 * Streak: +1 per calendar day with ≥1 completed story; a 1-day gap is
 * forgiven (freeze), 2+ days resets to 1.
 */
export function recordCompletedRead(id: string) {
  const profiles = readProfiles();
  const p = profiles.find((x) => x.id === id);
  if (!p) return;
  const today = new Date().toISOString().slice(0, 10);
  if (p.lastReadDate === today) return;
  const gapDays = p.lastReadDate
    ? Math.round(
        (Date.parse(today) - Date.parse(p.lastReadDate)) / 86_400_000
      )
    : Infinity;
  p.streak = gapDays <= 2 ? p.streak + 1 : 1;
  p.lastReadDate = today;
  write(profiles);
}
