"use client";

/**
 * Subscription tiers — single source of truth for every quota and feature
 * gate in the app. Mirrors the validated comparison table (June 2026).
 *
 * The tier for the current session is exposed client-side via the
 * non-httpOnly `lunireve_tier` cookie (written by setSession). V2 swaps the
 * cookie for the real Supabase/Stripe subscription, but the limit table and
 * the call sites stay identical.
 */

export type Tier = "free" | "plus" | "max";

export type TierLimits = {
  /** Child profiles allowed on the account. */
  profiles: number;
  /** Personalized stories per calendar month. */
  customPerMonth: number;
  /** Saved favorites. Infinity == unlimited. */
  favorites: number;
  /** MP3 audio downloads per month (feature ships in V2). */
  mp3PerMonth: number;
  /** Illustrated personalized "visual book" stories per month (V1.1). */
  visualBooksPerMonth: number;
  /** Discount on printed books, as a percentage (V1.1). */
  printDiscountPct: number;
  epub: boolean;
  adFree: boolean;
  advancedAudio: boolean;
  commercialUse: boolean;
};

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    profiles: 1,
    customPerMonth: 3,
    favorites: 30,
    mp3PerMonth: 0,
    visualBooksPerMonth: 0,
    printDiscountPct: 0,
    epub: false,
    adFree: false,
    advancedAudio: false,
    commercialUse: false,
  },
  plus: {
    profiles: 3,
    customPerMonth: 15,
    favorites: Infinity,
    mp3PerMonth: 1,
    visualBooksPerMonth: 2,
    printDiscountPct: 10,
    epub: true,
    adFree: true,
    advancedAudio: true,
    commercialUse: false,
  },
  max: {
    profiles: 50,
    customPerMonth: 60,
    favorites: Infinity,
    mp3PerMonth: 10,
    visualBooksPerMonth: 5,
    printDiscountPct: 20,
    epub: true,
    adFree: true,
    advancedAudio: true,
    commercialUse: true,
  },
};

/** Reads the (non-httpOnly) `lunireve_tier` cookie. Defaults to "free". */
export function readTier(): Tier {
  if (typeof document === "undefined") return "free";
  const m = document.cookie.match(/(?:^|;\s*)lunireve_tier=([^;]+)/);
  const raw = m?.[1];
  return raw === "plus" || raw === "max" ? raw : "free";
}

export function tierLimits(tier: Tier = readTier()): TierLimits {
  return TIER_LIMITS[tier];
}
