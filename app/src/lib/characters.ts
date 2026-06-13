"use client";

/**
 * Recurring characters (#16) — created once, reused across personalized
 * stories. localStorage now, `characters` table later. Free tier: 3 max
 * (brief #78).
 */

/** Free tier: 1 main + 2 secondary (#7). Paid (V2): 3 main + 6 secondary. */
export const FREE_LIMITS = { main: 1, secondary: 2 } as const;
export const PAID_LIMITS = { main: 3, secondary: 6 } as const;

export const CHARACTER_TYPES = ["enfant", "adulte", "animal", "creature"] as const;
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

export type SavedCharacter = {
  id: string;
  name: string;
  type: CharacterType;
  role: CharacterRole;
  gender: CharacterGender;
  /** Free description: "un chien beige très gourmand" */
  description: string;
  traits: string[]; // up to 4
  createdAt: string;
};

const KEY = "lunireve:characters";

export function readCharacters(): SavedCharacter[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedCharacter[];
  } catch {
    return [];
  }
}

function write(items: SavedCharacter[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* non-fatal */
  }
}

/** Remaining slots for a role on the free tier. */
export function slotsLeft(role: CharacterRole): number {
  const used = readCharacters().filter((c) => c.role === role).length;
  return FREE_LIMITS[role] - used;
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
