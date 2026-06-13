"use client";

/**
 * Recurring characters (#16) — created once, reused across personalized
 * stories. localStorage now, `characters` table later. Free tier: 3 max
 * (brief #78).
 */

export const FREE_CHARACTER_LIMIT = 3;

export const CHARACTER_TYPES = ["enfant", "adulte", "animal", "creature"] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

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

export function createCharacter(
  data: Omit<SavedCharacter, "id" | "createdAt">
): SavedCharacter | null {
  const all = readCharacters();
  if (all.length >= FREE_CHARACTER_LIMIT) return null;
  const character: SavedCharacter = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  write([...all, character]);
  return character;
}

export function deleteCharacter(id: string) {
  write(readCharacters().filter((c) => c.id !== id));
}
