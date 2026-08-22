"use client";

import { scopedKey } from "./userScope";
import { readTier } from "./tier";

/**
 * Recurring characters (#16) — created once, reused across personalized
 * stories. localStorage now (per-account scoped), `characters` table later.
 */

/** Free tier: 1 main + 2 secondary (#7). Paid: 3 main + 6 secondary. */
export const FREE_LIMITS = { main: 1, secondary: 2 } as const;
export const PAID_LIMITS = { main: 3, secondary: 6 } as const;

/** Character slot limits for the current account's tier. */
export function characterLimits() {
  return readTier() === "free" ? FREE_LIMITS : PAID_LIMITS;
}

export const CHARACTER_TYPES = ["enfant", "adulte", "animal", "doudou", "creature"] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

export const CHARACTER_GENDERS = ["fille", "garcon", "neutre"] as const;
export type CharacterGender = (typeof CHARACTER_GENDERS)[number];

export const CHARACTER_TRAITS = [
  "affectueux",
  "joueur",
  "curieux",
  "courageux",
  "timide",
  "farceur",
  "protecteur",
  "reveur",
  "energique",
  "calme",
] as const;

/** A character can star as the hero or play a supporting role. */
export type CharacterRole = "main" | "secondary";

/**
 * Visual appearance picked in the creation wizard. All fields optional and
 * stored as option ids from lib/characterOptions.ts. Human and animal fields
 * live side by side; only the ones matching the character's type are set.
 */
export type CharacterAppearance = {
  // Human
  skin?: string;
  hairColor?: string;
  /** A cut from HAIR_STYLES, or a special (chauve/foulard/hidjab). */
  hairStyle?: string;
  eyes?: string;
  glasses?: string;
  build?: string;
  mobility?: string[];
  hat?: string;
  clothing?: string[];
  extras?: string[];
  // Animal
  family?: string;
  species?: string;
  coat?: string;
  size?: string;
  accessories?: string[];
};

export type SavedCharacter = {
  id: string;
  name: string;
  type: CharacterType;
  role: CharacterRole;
  gender: CharacterGender;
  age?: number;
  /** Composed one-line summary (auto-built from appearance by the wizard). */
  description: string;
  traits: string[]; // up to 4 (trait ids from characterOptions)
  appearance?: CharacterAppearance;
  createdAt: string;
};

const KEY = "lunireve:characters";

export function readCharacters(): SavedCharacter[] {
  try {
    return JSON.parse(localStorage.getItem(scopedKey(KEY)) ?? "[]") as SavedCharacter[];
  } catch {
    return [];
  }
}

function write(items: SavedCharacter[]) {
  try {
    localStorage.setItem(scopedKey(KEY), JSON.stringify(items));
  } catch {
    /* non-fatal */
  }
}

/** Remaining slots for a role on the current account's tier. */
export function slotsLeft(role: CharacterRole): number {
  const used = readCharacters().filter((c) => c.role === role).length;
  return characterLimits()[role] - used;
}

export function createCharacter(
  data: Omit<SavedCharacter, "id" | "createdAt">
): SavedCharacter | null {
  if (slotsLeft(data.role) <= 0) return null;
  const character: SavedCharacter = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  write([...readCharacters(), character]);
  return character;
}

export function deleteCharacter(id: string) {
  write(readCharacters().filter((c) => c.id !== id));
}

export function findCharacter(id: string): SavedCharacter | undefined {
  return readCharacters().find((c) => c.id === id);
}

/** Edit an existing character in place (the wizard reuses this on save). */
export function updateCharacter(
  id: string,
  patch: Partial<Omit<SavedCharacter, "id" | "createdAt">>
): void {
  write(readCharacters().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

/**
 * Copy a character so a parent can branch a variant (same hero, different
 * look) without losing the original. Returns null when the role's slots are
 * full, so the caller can explain rather than silently do nothing.
 */
export function duplicateCharacter(id: string, copyName: string): SavedCharacter | null {
  const source = readCharacters().find((c) => c.id === id);
  if (!source) return null;
  return createCharacter({
    name: copyName,
    type: source.type,
    role: source.role,
    gender: source.gender,
    age: source.age,
    description: source.description,
    traits: [...source.traits],
    appearance: source.appearance ? { ...source.appearance } : undefined,
  });
}
