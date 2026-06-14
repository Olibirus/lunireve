"use client";

import { scopedKey } from "./userScope";
import { tierLimits } from "./tier";

/**
 * Favorites store — per-account scoped, tier-capped. Replaces the inline
 * `lunireve:favorites` reads/writes that previously lived (unscoped) in the
 * story card, story page, and account pages, which leaked one account's
 * favorites to every other login on the device.
 */

const BASE = "lunireve:favorites";

export function favoritesCap(): number {
  return tierLimits().favorites;
}

export function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(scopedKey(BASE)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return readFavorites().includes(slug);
}

function write(list: string[]) {
  try {
    localStorage.setItem(scopedKey(BASE), JSON.stringify(list));
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
