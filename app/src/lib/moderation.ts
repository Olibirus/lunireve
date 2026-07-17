import type { CustomStoryParams } from "./customStories";

/**
 * Content moderation for user-provided story inputs (names, places, extra
 * plot details). Defense in depth, four layers (see lib/ai/safetyGate.ts for
 * layer 2, the semantic multilingual gate on inputs AND generated output):
 *
 *  1. This module — normalized blocklist screening + shape validation. It
 *     runs CLIENT-SIDE in /creer for instant feedback, and SERVER-SIDE in
 *     generateStoryAction as a free pre-filter (the client check can be
 *     bypassed, the server one cannot).
 *  2. Prompt hardening (lib/ai SAFETY_RULES) — user field values are declared
 *     as literal data, never instructions, and the model must swap any
 *     inappropriate value for a wholesome alternative.
 *  3. The model itself — Claude refuses sexual/violent content for children.
 *
 * Matching is accent-, case- and leetspeak-insensitive. Short crude words are
 * matched as whole tokens only (so "conte", "calcul", "députée" never trip);
 * unambiguous phrases are matched as substrings with spaces removed (so
 * "f i l s 2 p u t e" still trips).
 */

/** Lowercase, strip accents, map common leetspeak to letters. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i");
}

/**
 * Whole-token blocklist (normalized, no accents). Keep entries lowercase.
 * Ambiguous French fragments (con, cul, sang, baiser, heroine, grenade...)
 * are deliberately ABSENT: they live inside everyday kid-story words.
 */
const BANNED_TOKENS = new Set<string>([
  // FR profanity / sexual
  "pute", "putain", "salope", "salaud", "connard", "connasse",
  "encule", "encules", "enculer", "merde", "merdes", "chiasse",
  "bite", "bites", "couille", "couilles", "nichon", "nichons",
  "zizi", "zguegue", "teub", "chatte", "foufoune",
  "sexe", "sexuel", "sexuelle", "sexuels", "sexuelles", "sexy",
  "porno", "porn", "pornographique", "penis", "vagin", "vulve",
  "seins", "nue", "nues", "nu", "nus", "nudiste",
  "fellation", "sodomie", "masturbation", "masturber", "orgasme",
  "prostituee", "prostitue", "bordel", "baise", "niquer", "nique",
  "batard", "batarde", "pouffiasse", "garce",
  // FR slurs
  "negre", "negresse", "bougnoule", "youpin", "youpine", "pd",
  "tapette", "tarlouze", "gouine", "travelo",
  // FR violence / drugs / self-harm
  "viol", "violer", "violeur", "violee", "pedophile", "pedophilie",
  "inceste", "tuer", "tue", "tues", "meurtre", "meurtrier",
  "massacre", "massacrer", "decapiter", "egorger", "poignarder",
  "torturer", "torture", "flingue", "fusil", "revolver",
  "mitraillette", "kalachnikov", "suicide", "suicider",
  "drogue", "drogues", "cocaine", "cannabis", "shit",
  "nazi", "nazis", "hitler", "terroriste", "djihad", "jihad",
  // EN profanity / sexual
  "fuck", "fucking", "fucked", "bitch", "whore", "slut",
  "asshole", "bastard", "cunt", "dick", "cock", "pussy",
  "boobs", "tits", "vagina", "nude", "naked", "hentai",
  "blowjob", "handjob", "orgasm", "masturbate", "prostitute",
  // EN slurs
  "nigger", "nigga", "faggot", "tranny",
  // EN violence / drugs / self-harm
  "rape", "rapist", "raped", "pedophile", "incest",
  "kill", "killing", "murder", "murderer", "behead", "stab",
  "gun", "rifle", "shotgun", "heroin", "meth", "weed",
  "terrorist", "jihadist",
  // Common profanity in other languages (short tokens the semantic gate can
  // underscore): ES / IT / DE / PT / PL / AR(latinized)
  "puta", "puto", "mierda", "cabron", "cabrona", "pendejo", "pendeja",
  "polla", "verga", "gilipollas", "joder", "follar", "marica", "maricon",
  "cazzo", "merda", "stronzo", "stronza", "puttana", "vaffanculo", "troia",
  "porca", "minchia", "coglione",
  "scheisse", "arschloch", "hurensohn", "fotze", "schwanz", "wichser",
  "caralho", "foda", "foder", "buceta", "porra", "viado",
  "kurwa", "chuj", "pizda", "jebac", "spierdalaj",
  // NOTE: short Arabic-latinized tokens like "nik"/"kus" are deliberately
  // absent: they collide with real first names; the semantic gate judges
  // them in context instead.
  "sharmouta", "kahba", "zamel",
]);

/**
 * Substring blocklist, checked on the normalized text with all separators
 * removed. Long enough to be unambiguous.
 */
const BANNED_PHRASES = [
  "filsdepute", "niquetamere", "niquesamere", "tagueule",
  "fermetagueule", "vatefaireenculer", "suckmydick", "sonofabitch",
  "motherfucker", "gangbang", "deepthroat",
];

export type ModerationResult = { ok: true } | { ok: false; reason: "banned" | "url" };

/** Screen one free-text value. */
export function moderateText(text: string): ModerationResult {
  if (!text) return { ok: true };
  const norm = normalize(text);

  // No links in story inputs (spam / injection vector).
  if (/https?:\/\/|www\./.test(norm)) return { ok: false, reason: "url" };

  const tokens = norm.split(/[^a-z]+/).filter(Boolean);
  for (const token of tokens) {
    if (BANNED_TOKENS.has(token)) return { ok: false, reason: "banned" };
  }

  // Anti-evasion: collapse runs of single letters ("p.u.t.e", "f u c k")
  // back into words and re-check them.
  let run: string[] = [];
  const flush = () => {
    const joined = run.join("");
    run = [];
    return joined.length >= 2 && BANNED_TOKENS.has(joined);
  };
  for (const token of tokens) {
    if (token.length === 1) {
      run.push(token);
    } else if (flush()) {
      return { ok: false, reason: "banned" };
    }
  }
  if (flush()) return { ok: false, reason: "banned" };

  const squashed = norm.replace(/[^a-z]/g, "");
  for (const phrase of BANNED_PHRASES) {
    if (squashed.includes(phrase)) return { ok: false, reason: "banned" };
  }

  return { ok: true };
}

/**
 * A name: letters (any language), spaces, hyphens, apostrophes; 2-30 chars.
 * Blocks emoji, digits, URLs and symbol soup in hero/companion names.
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return false;
  if (!/^[\p{L}][\p{L}' \-]*$/u.test(trimmed)) return false;
  return moderateText(trimmed).ok;
}

export type ModerationReason = "banned" | "url" | "invalid-name" | "too-long";

export type ParamsModeration =
  | { ok: true }
  | { ok: false; fields: { field: string; reason: ModerationReason }[] };

/**
 * Full server-side validation of story params: every free-text field is
 * screened, names must look like names, and lengths are capped (the client
 * caps via maxLength, the server re-checks). ALL offending fields are
 * returned at once so the user fixes everything in a single pass.
 */
export function moderateStoryParams(params: CustomStoryParams): ParamsModeration {
  const flagged: { field: string; reason: ModerationReason }[] = [];

  if (!isValidName(params.heroName)) {
    flagged.push({ field: "heroName", reason: "invalid-name" });
  }

  const freeText: [string, string, number][] = [
    ["trait", params.trait, 80],
    ["heroDescription", params.heroDescription ?? "", 500],
    ["friend", params.friend, 200],
    ["place", params.place, 80],
    ["fear", params.fear, 80],
    ["subTheme", params.subTheme ?? "", 60],
    ["moral", params.moral ?? "", 100],
  ];
  for (const info of params.extraInfo ?? []) freeText.push(["extraInfo", info, 140]);

  for (const [field, value, max] of freeText) {
    if (!value) continue;
    if (value.length > max) {
      flagged.push({ field, reason: "too-long" });
      continue;
    }
    const res = moderateText(value);
    if (!res.ok) flagged.push({ field, reason: res.reason });
  }

  for (const companion of (params.companions ?? []).slice(0, 8)) {
    if (companion.name && !isValidName(companion.name)) {
      flagged.push({ field: "companions", reason: "invalid-name" });
      break;
    }
  }

  return flagged.length ? { ok: false, fields: flagged } : { ok: true };
}
