import "server-only";
import OpenAI from "openai";

/**
 * Semantic, multilingual safety gate for personalized-story inputs and
 * outputs. This is the layer the blocklist cannot provide: it understands
 * slang, misspellings, ANY language, and bad intent phrased with innocent
 * words ("the hero sells white powder to kids"), the way a general-public
 * LLM would judge it.
 *
 * Built on OpenAI's moderation endpoint (omni-moderation-latest): free of
 * charge, ~200ms, 40+ languages, purpose-built classifier. Thresholds are
 * tuned STRICTER than the API defaults because the readers are children,
 * with one deliberate exception: mild "violence" scores stay permissive,
 * because kid stories legitimately mention dragons to defeat or storms to
 * brave, and the generation prompt already softens anything rough.
 *
 * Defense in depth (4 layers):
 *  1. blocklist (lib/moderation.ts) — instant, free, obvious words;
 *  2. THIS GATE on the user's inputs — semantic, multilingual;
 *  3. prompt hardening (SAFETY_RULES) — the model treats fields as data and
 *     silently swaps anything inappropriate for a wholesome alternative;
 *  4. THIS GATE again on the generated story — final verification before the
 *     text is stored and shown.
 *
 * Fail-open policy: if the moderation API is unreachable, we let the request
 * through and rely on layers 1 and 3 (an outage must not take down story
 * creation), but we log loudly so it shows in the Vercel logs.
 */

/** Max score allowed per category on USER INPUTS (children's product). */
const INPUT_LIMITS: Record<string, number> = {
  "sexual": 0.2,
  "sexual/minors": 0.02,
  "hate": 0.25,
  "hate/threatening": 0.1,
  "harassment": 0.6,
  "harassment/threatening": 0.3,
  // Calibrated on real samples: innocent kid inputs (potions, pirate
  // treasure, magic powder) score <= 0.04; glorified theft scores ~0.28.
  "illicit": 0.15,
  "illicit/violent": 0.15,
  "self-harm": 0.2,
  "self-harm/intent": 0.1,
  "self-harm/instructions": 0.05,
  "violence": 0.65,
  "violence/graphic": 0.25,
};

/** Slightly looser on the generated OUTPUT: it is Claude-written prose that
    already followed SAFETY_RULES; we only want to catch real failures. */
const OUTPUT_LIMITS: Record<string, number> = {
  ...INPUT_LIMITS,
  "violence": 0.75,
  "harassment": 0.75,
};

export type GateResult =
  | { ok: true }
  | { ok: false; field: string; category: string };

function violatedCategory(
  scores: Record<string, number>,
  limits: Record<string, number>
): string | null {
  for (const [category, limit] of Object.entries(limits)) {
    if ((scores[category] ?? 0) > limit) return category;
  }
  return null;
}

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Check a set of labeled free-text fields (hero name, place, plot notes...).
 * One API call for all fields; returns the first offending field so the
 * caller can log it (the user only ever sees a generic message).
 */
export async function moderateStoryFields(
  fields: Array<{ field: string; text: string }>
): Promise<GateResult> {
  const nonEmpty = fields.filter((f) => f.text && f.text.trim().length > 0);
  if (nonEmpty.length === 0) return { ok: true };

  const client = getClient();
  if (!client) {
    console.error("[Lunireve] safety gate skipped: OPENAI_API_KEY missing");
    return { ok: true }; // fail open, layers 1+3 still apply
  }

  try {
    const res = await client.moderations.create({
      model: "omni-moderation-latest",
      input: nonEmpty.map((f) => f.text),
    });
    for (let i = 0; i < res.results.length; i++) {
      const scores = res.results[i].category_scores as unknown as Record<string, number>;
      const category = violatedCategory(scores, INPUT_LIMITS);
      if (category) {
        return { ok: false, field: nonEmpty[i].field, category };
      }
    }
    return { ok: true };
  } catch (e) {
    console.error("[Lunireve] safety gate (inputs) unavailable, failing open:", e);
    return { ok: true };
  }
}

/** Final check on the generated story before it is stored and displayed. */
export async function moderateGeneratedStory(text: string): Promise<GateResult> {
  const client = getClient();
  if (!client) return { ok: true };

  try {
    // The endpoint caps input size; a story fits comfortably, but clamp anyway.
    const res = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text.slice(0, 30_000),
    });
    const scores = res.results[0]?.category_scores as unknown as Record<string, number>;
    const category = scores ? violatedCategory(scores, OUTPUT_LIMITS) : null;
    return category ? { ok: false, field: "output", category } : { ok: true };
  } catch (e) {
    console.error("[Lunireve] safety gate (output) unavailable, failing open:", e);
    return { ok: true };
  }
}
