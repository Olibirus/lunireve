"use client";

import type { FoxColor } from "@/components/brand/FoxCloud";

/**
 * Child profiles — Phase 1 store (localStorage, client only).
 *
 * Batch 9+ swaps this module's internals for Supabase queries against the
 * `child_profiles` table; the function signatures stay identical so the UI
 * doesn't change. Free tier: 1 profile (enforced here AND server-side later).
 */

export const FREE_PROFILE_LIMIT = 1;

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
};

const KEY = "lunireve:profiles";
const ACTIVE_KEY = "lunireve:activeProfile";

export function readProfiles(): ChildProfile[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ChildProfile[];
  } catch {
    return [];
  }
}

function write(profiles: ChildProfile[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profiles));
  } catch {
    /* non-fatal */
  }
}

export function createProfile(
  data: Omit<ChildProfile, "id" | "streak" | "lastReadDate" | "createdAt">
): ChildProfile | null {
  const profiles = readProfiles();
  if (profiles.length >= FREE_PROFILE_LIMIT) return null;
  const profile: ChildProfile = {
    ...data,
    id: crypto.randomUUID(),
    streak: 0,
    lastReadDate: null,
    createdAt: new Date().toISOString(),
  };
  write([...profiles, profile]);
  return profile;
}

export function updateProfile(id: string, patch: Partial<ChildProfile>) {
  write(readProfiles().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function deleteProfile(id: string) {
  write(readProfiles().filter((p) => p.id !== id));
  if (getActiveProfileId() === id) clearActiveProfile();
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function getActiveProfile(): ChildProfile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return readProfiles().find((p) => p.id === id) ?? null;
}

export function setActiveProfile(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_KEY);
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
