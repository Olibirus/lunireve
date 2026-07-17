"use client";

import { mockStories, ageToRange } from "@/data/mock-stories";

/**
 * Admin stories store (#7 admin CRUD) — a working CMS-lite over the library.
 * localStorage now, seeded from the mock library and merged with it so new
 * library stories always appear; Phase 2 swaps these for Supabase queries
 * against the `stories` table. Edits/deletes here are real (persisted), which
 * is why the table's edit/delete buttons now do something.
 */

const KEY = "lunireve:adminStories";
const KEY_DELETED = "lunireve:adminStories:deleted";

export type AdminStory = {
  slug: string;
  title: string;
  genre: string;
  ageRange: string;
  readingMinutes: number;
  rating: number;
  status: "published" | "unpublished";
  /** Full text for admin-created stories (mock library stories carry their
   * own content in mock-stories; this is only set for locally created ones). */
  body?: string[];
};

function fromMock(): AdminStory[] {
  return mockStories.map((s) => ({
    slug: s.slug,
    title: s.title,
    genre: s.genre,
    ageRange: s.ageRange,
    readingMinutes: s.readingMinutes,
    rating: s.rating,
    status: "published" as const,
  }));
}

function readDeleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_DELETED) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function write(items: AdminStory[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* non-fatal */
  }
}

/** Stored overrides merged with the mock library, minus deleted slugs. */
export function readStories(): AdminStory[] {
  try {
    const deleted = readDeleted();
    const raw = localStorage.getItem(KEY);
    const stored: AdminStory[] = raw ? (JSON.parse(raw) as AdminStory[]) : [];
    const storedSlugs = new Set(stored.map((s) => s.slug));
    const extras = fromMock().filter((s) => !storedSlugs.has(s.slug) && !deleted.includes(s.slug));
    return [...stored, ...extras].filter((s) => !deleted.includes(s.slug));
  } catch {
    return fromMock();
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function saveStory(story: AdminStory, originalSlug?: string) {
  const all = readStories();
  const idx = originalSlug ? all.findIndex((s) => s.slug === originalSlug) : -1;
  if (idx >= 0) all[idx] = story;
  else all.unshift(story);
  write(all);
}

/**
 * Save a story generated through the real creation flow (/creer) as a LIBRARY
 * story: an admin using the wizard produces bank content, not a personalized
 * story attributed to a family (feedback: "Nouvelle histoire" opens the real
 * flow but counts as library). Phase 2 inserts a `stories` row (type=bank).
 */
export function saveLibraryStory(
  title: string,
  body: string[],
  meta: { theme: string; heroAge: number; readingAge?: number }
): AdminStory {
  const words = body.join(" ").split(/\s+/).filter(Boolean).length;
  const story: AdminStory = {
    slug: slugify(title) || `histoire-${Date.now()}`,
    title,
    genre: meta.theme,
    ageRange: ageToRange(meta.readingAge ?? meta.heroAge),
    readingMinutes: Math.max(2, Math.round(words / 140)),
    rating: 0,
    status: "published",
    body,
  };
  saveStory(story);
  return story;
}

export function deleteStory(slug: string) {
  try {
    const deleted = readDeleted();
    if (!deleted.includes(slug)) {
      localStorage.setItem(KEY_DELETED, JSON.stringify([...deleted, slug]));
    }
  } catch {
    /* non-fatal */
  }
  write(readStories().filter((s) => s.slug !== slug));
}
