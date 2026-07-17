"use client";

/**
 * Client-side session check via the non-httpOnly `lunireve_role` cookie
 * (set/cleared by the auth server actions). UI gating only — every real
 * permission stays enforced server-side.
 */
export function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("lunireve_role="));
}

/** Current role from the cookie, or null when logged out. */
export function getRole(): "admin" | "user" | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((c) => c.startsWith("lunireve_role="));
  if (!entry) return null;
  return entry.slice("lunireve_role=".length) === "admin" ? "admin" : "user";
}

/**
 * Cross-tab logout sync. The session cookie is cleared server-side (so every
 * tab IS logged out immediately); this broadcast makes other OPEN tabs update
 * their UI right away instead of waiting for a reload. `storage` events only
 * fire in other tabs, which is exactly what we want.
 */
const LOGOUT_BROADCAST_KEY = "lunireve:logoutAt";

export function broadcastLogout(): void {
  try {
    localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
  } catch {
    /* private mode — other tabs will catch up on navigation */
  }
}

/** Subscribe to logouts from other tabs. Returns an unsubscribe function. */
export function onLogoutBroadcast(cb: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === LOGOUT_BROADCAST_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Display name for the logged-in account, from the `lunireve_user` cookie.
 * Emails are shortened to their local part and capitalized ("marie.dupont@x"
 * -> "Marie.dupont") so the header shows a name, not an address.
 */
export function getUsername(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((c) => c.startsWith("lunireve_user="));
  if (!entry) return null;
  const raw = decodeURIComponent(entry.slice("lunireve_user=".length)).trim();
  if (!raw) return null;
  const name = raw.includes("@") ? raw.split("@")[0] : raw;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
