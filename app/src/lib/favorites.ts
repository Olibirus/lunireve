"use client";

import { profileScopedKey, profileScopedKeyFor } from "./userScope";
import { tierLimits } from "./tier";

/**
 * Favorites store — scoped per account AND per active child profile, tier-
 * capped. A freshly created child profile starts with no favorites instead of
 * inheriting the parent's (or another child's).
 */

const BASE = "lunireve:favorites";

export function favoritesCap(): number {
  return tierLimits().favorites;
}

export function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(profileScopedKey(BASE)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return readFavorites().includes(slug);
}

/**
 * Favorites of a SPECIFIC reader ("parent" or a child profile id), whatever
 * profile is currently active. Lets the parent dashboard show one favorites
 * row per reader.
 */
export function readFavoritesFor(profileId: string): string[] {
  try {
    return JSON.parse(
      localStorage.getItem(profileScopedKeyFor(BASE, profileId)) ?? "[]"
    ) as string[];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(profileScopedKey(BASE), JSON.stringify(list));
  } catch {
    /* quota / private mode — non-fatal */
  }
}

/**
 * Toggle a favorite. Returns the resulting state and whether an add was
 * blocked by the tier cap (free tier = 30). Callers with room in the UI can
 * surface an upgrade prompt when `blocked` is true.
 */
export function toggleFavorite(slug: string): { active: boolean; blocked: boolean } {
  const list = readFavorites();
  if (list.includes(slug)) {
    write(list.filter((s) => s !== slug));
    return { active: false, blocked: false };
  }
  if (list.length >= favoritesCap()) {
    return { active: false, blocked: true };
  }
  write([...list, slug]);
  return { active: true, blocked: false };
}
