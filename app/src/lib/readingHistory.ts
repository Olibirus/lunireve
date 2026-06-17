"use client";

import { profileScopedKey } from "./userScope";

/**
 * Reading history — per account AND per active reader (parent / each child
 * profile), so "recently read" and quiz results never leak between accounts
 * or between readers. Keyed by story slug (bank stories) or custom-story id.
 *
 * localStorage now; DB-backed history table later (signatures unchanged).
 */

export type QuizResult = { score: number; total: number; at: string };

export type ReadingRecord = {
  slug: string;
  /** Furthest scroll progress reached, 0..100. */
  progress: number;
  /** ISO timestamp of the most recent read. */
  lastReadAt: string;
  quiz?: QuizResult;
};

const KEY = "lunireve:readingHistory";

function readMap(): Record<string, ReadingRecord> {
  try {
    return JSON.parse(localStorage.getItem(profileScopedKey(KEY)) ?? "{}") as Record<
      string,
      ReadingRecord
    >;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, ReadingRecord>) {
  try {
    localStorage.setItem(profileScopedKey(KEY), JSON.stringify(map));
  } catch {
    /* quota / private mode — non-fatal */
  }
}

export function getRecord(slug: string): ReadingRecord | undefined {
  return readMap()[slug];
}

/** Save the latest scroll progress + touch the last-read timestamp. */
export function recordProgress(slug: string, progress: number) {
  if (progress <= 0) return;
  const map = readMap();
  const prev = map[slug];
  map[slug] = {
    slug,
    progress: Math.max(Math.round(progress), prev?.progress ?? 0),
    lastReadAt: new Date().toISOString(),
    quiz: prev?.quiz,
  };
  writeMap(map);
}

/** Record (or overwrite) the quiz result for a story. */
export function recordQuizResult(slug: string, score: number, total: number) {
  const map = readMap();
  const prev: ReadingRecord =
    map[slug] ?? { slug, progress: 0, lastReadAt: new Date().toISOString() };
  map[slug] = { ...prev, quiz: { score, total, at: new Date().toISOString() } };
  writeMap(map);
}

/** All read stories for the current reader, newest first. */
export function readHistory(): ReadingRecord[] {
  return Object.values(readMap()).sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
}
