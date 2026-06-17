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
