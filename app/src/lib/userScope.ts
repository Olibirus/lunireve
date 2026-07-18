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

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

/** Login identifier (email or temp username) — display / identity purposes. */
export function currentUser(): string {
  return readCookie("lunireve_user") ?? "anon";
}

/**
 * Stable storage namespace for the logged-in account: the Supabase user id
 * when there is one (real accounts, `lunireve_uid` cookie), else the login
 * name (temp accounts, anonymous). Keying by id instead of email is the
 * safety net for two real-world cases: an email re-registered after an
 * account deletion must NOT resurrect the previous owner's local data (new
 * signup = new id = fresh bucket), and a Google sign-in that links onto an
 * existing email account keeps the SAME Supabase user, so it lands in the
 * same bucket no matter which method was used.
 */
function accountKey(): string {
  const uid = readCookie("lunireve_uid");
  if (uid) {
    migrateLegacyScope(uid);
    return uid;
  }
  return currentUser();
}

/**
 * One-time per device+account: real accounts used to be namespaced by email.
 * Copy that bucket onto the user id so nothing is lost by the switch (only
 * keys the id bucket does not already have).
 */
function migrateLegacyScope(uid: string) {
  try {
    const flag = `lunireve:scopeMigrated::${uid}`;
    if (localStorage.getItem(flag)) return;
    const legacy = `::u:${currentUser()}`;
    const target = `::u:${uid}`;
    for (const key of Object.keys(localStorage)) {
      if (!key.includes(legacy)) continue;
      const migrated = key.replaceAll(legacy, target);
      if (migrated !== key && localStorage.getItem(migrated) === null) {
        const value = localStorage.getItem(key);
        if (value !== null) localStorage.setItem(migrated, value);
      }
    }
    localStorage.setItem(flag, "1");
  } catch {
    /* non-fatal */
  }
}

/** Namespace a base localStorage key to the current account. */
export function scopedKey(base: string): string {
  return `${base}::u:${accountKey()}`;
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
  return `${base}::u:${accountKey()}::p:${profileId}`;
}

/**
 * Namespace a key to the account AND the active child profile, so per-reader
 * data (reading progress, favorites) never leaks between a parent and a
 * freshly created child profile.
 */
export function profileScopedKey(base: string): string {
  return profileScopedKeyFor(base, currentProfile());
}
