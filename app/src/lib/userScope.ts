"use client";

/**
 * Per-account scoping for localStorage stores.
 *
 * All client stores (profiles, custom stories, favorites, characters,
 * notifications, account info, submissions) are namespaced to the logged-in
 * account so data never leaks between logins on the same device. The account
 * id comes from the non-httpOnly `lunireve_user` cookie written by
 * setSession; anonymous visitors share the "anon" bucket.
 *
 * When the DB swap lands (Batch 9+) this disappears: rows are keyed by the
 * Supabase user id server-side and scoping is enforced by RLS.
 */

export function currentUser(): string {
  if (typeof document === "undefined") return "anon";
  const m = document.cookie.match(/(?:^|;\s*)lunireve_user=([^;]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : "anon";
}

/** Namespace a base localStorage key to the current account. */
export function scopedKey(base: string): string {
  return `${base}::u:${currentUser()}`;
}

/**
 * The active child profile id ("parent" when reading as the parent / none
 * active). Read directly from localStorage to avoid a circular import.
 */
export function currentProfile(): string {
  if (typeof window === "undefined") return "parent";
  try {
    // Must match the key profiles.ts writes via scopedKey(ACTIVE_KEY), i.e.
    // the account-scoped active-profile key, otherwise per-child separation
    // never triggers (and parent/child readers share one bucket).
    return localStorage.getItem(scopedKey("lunireve:activeProfile")) || "parent";
  } catch {
    return "parent";
  }
}

/**
 * Namespace a key to the account AND a specific reader (a child profile id, or
 * "parent"). Used directly when the parent dashboard rolls up every reader's
 * history, where the active profile is not the reader being read.
 */
export function profileScopedKeyFor(base: string, profileId: string): string {
  return `${base}::u:${currentUser()}::p:${profileId}`;
}

/**
 * Namespace a key to the account AND the active child profile, so per-reader
 * data (reading progress, favorites) never leaks between a parent and a
 * freshly created child profile.
 */
export function profileScopedKey(base: string): string {
  return profileScopedKeyFor(base, currentProfile());
}
