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
