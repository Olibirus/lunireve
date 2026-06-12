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
