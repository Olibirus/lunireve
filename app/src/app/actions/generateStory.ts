"use server";

import { generateStoryText } from "@/lib/ai";
import { getSession } from "@/lib/auth/session";
import { ageToRange } from "@/data/mock-stories";
import { insertCustomStory } from "@/db/customStories";
import { moderateStoryParams } from "@/lib/moderation";
import {
  HERO_TYPES,
  FREE_HERO_MAX_AGE,
  MAX_COMPANIONS,
  MAX_EXTRA_INFO,
  relationLabel,
  heroTypeLabel,
} from "@/lib/storyOptions";
import type { CustomStoryParams } from "@/lib/customStories";

export type GenerateResult =
  | {
      ok: true;
      title: string;
      body: string[];
      glossary: { word: string; definition: string }[];
      id: string | null;
    }
  | { ok: false; reason?: "moderation" | "error" };

const MOOD_FR: Record<CustomStoryParams["mood"], string> = {
  drole: "drôle et légère",
  mysterieux: "mystérieuse et intrigante",
  touchant: "touchante et tendre",
  palpitant: "palpitante, pleine de rebondissements",
  doux: "douce et apaisante, parfaite pour s'endormir",
};

/** Strip em dashes from model output (platform-wide rule #24). */
function cleanText(text: string): string {
  return text.replace(/\s—\s/g, ", ").replace(/—/g, "-");
}

/**
 * Real personalized story generation via the provider layer (Claude).
 *
 * Server-side gates, in order:
 *  1. auth (session required),
 *  2. content moderation on every free-text field (lib/moderation.ts) — the
 *     client runs the same check for instant feedback, this one is the wall,
 *  3. tier clamps (free plan: child hero only, age <= 12),
 * then the prompt is composed with user values wrapped in « » so the model
 * treats them as data (see SAFETY_RULES in lib/ai/types.ts).
 */
export async function generateStoryAction(
  params: CustomStoryParams,
  profileId: string | null = null
): Promise<GenerateResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "error" };

  // 2 — moderation wall. No fallback story on the client for this one.
  const check = moderateStoryParams(params);
  if (!check.ok) {
    console.warn(
      `[Lunireve] story input blocked (${check.field}: ${check.reason}) for ${session.username}`
    );
    return { ok: false, reason: "moderation" };
  }

  // 3 — tier clamps (quietly cap instead of failing: the UI already prevents
  // this, so anything arriving here is a bypass attempt or a stale client).
  const tier = session.tier ?? "free";
  if (tier === "free") {
    if (params.heroAge > FREE_HERO_MAX_AGE) params.heroAge = FREE_HERO_MAX_AGE;
    const heroType = HERO_TYPES.find((h) => h.id === params.heroType);
    if (heroType && !heroType.free) params.heroType = "garcon";
  }

  const companions = (params.companions ?? [])
    .filter((c) => c.name.trim().length >= 2)
    .slice(0, MAX_COMPANIONS);
  const extraInfo = (params.extraInfo ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_EXTRA_INFO);
  const readingAge = params.readingAge ?? params.heroAge;
  const heroKind = heroTypeLabel(params.heroType, "fr").toLowerCase();

  const lines = [
    `Écris une histoire pour enfant dont le héros est « ${params.heroName} », ${params.heroAge} ans${heroKind ? ` (${heroKind})` : ""}.`,
    params.sequelOf &&
      `IMPORTANT : cette histoire est l'ÉPISODE SUIVANT de « ${params.sequelOf} ». Garde le même héros et les mêmes personnages, fais un bref clin d'œil à l'aventure précédente au début, mais invente une intrigue NOUVELLE et clairement différente.`,
    params.trait && `Particularité du héros : « ${params.trait} ».`,
    `Thème : ${params.theme}. Ambiance : ${MOOD_FR[params.mood]}.`,
    companions.length
      ? `Personnages secondaires : ${companions
          .map((c) => `« ${c.name} », ${relationLabel(c.relation, "fr")} du héros`)
          .join(" ; ")}.`
      : params.friend && `Un personnage secondaire apparaît : « ${params.friend} ».`,
    params.place &&
      `CONSIGNE OBLIGATOIRE : une partie importante de l'histoire se déroule ici : « ${params.place} ». Ce lieu doit apparaître explicitement dans le récit.`,
    params.fear &&
      `Le héros surmonte progressivement cette peur au fil de l'histoire : « ${params.fear} ». Traite-la avec douceur, jamais de façon effrayante.`,
    ...extraInfo.map(
      (info) =>
        `CONSIGNE OBLIGATOIRE à intégrer naturellement dans l'intrigue : « ${info} ».`
    ),
    "Termine sur une note apaisante adaptée au coucher.",
    "N'utilise jamais de tiret cadratin dans le texte.",
  ].filter(Boolean) as string[];

  try {
    const result = await generateStoryText({
      language: params.language,
      ageRange: ageToRange(readingAge),
      prompt: lines.join("\n"),
      characters: [
        {
          name: params.heroName,
          description: `héros de l'histoire, ${params.heroAge} ans${heroKind ? `, ${heroKind}` : ""}${params.trait ? `, ${params.trait}` : ""}`,
        },
        ...companions.map((c) => ({
          name: c.name,
          description: `${relationLabel(c.relation, "fr")} du héros`,
        })),
      ],
      // Length + moral are driven by ageRange in the provider (WORD_RANGE_BY_AGE).
    });

    const body = result.scenes.length
      ? result.scenes.map((s) => cleanText(s.text))
      : cleanText(result.fullText).split("\n\n").filter(Boolean);

    const title = cleanText(result.title);
    const glossary = (result.glossary ?? []).map((g) => ({
      word: cleanText(g.word),
      definition: cleanText(g.definition),
    }));

    // Persist to the DB so the /histoire-perso/<id> link is shareable across
    // devices. A storage failure must not lose the generated story, so we fall
    // back to id=null and let the client keep its local copy.
    let id: string | null = null;
    try {
      id = await insertCustomStory({
        title,
        body,
        params,
        profileId,
        ownerUserId: session.userId ?? null,
        glossary,
        model: result.model,
      });
    } catch (e) {
      console.error("[Lunireve] failed to persist generated story:", e);
    }

    return { ok: true, title, body, glossary, id };
  } catch (e) {
    console.error("[Lunireve] story generation failed:", e);
    return { ok: false, reason: "error" };
  }
}
