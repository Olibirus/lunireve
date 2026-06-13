"use server";

import { generateStoryText } from "@/lib/ai";
import { getSession } from "@/lib/auth/session";
import { ageToRange } from "@/data/mock-stories";
import { insertCustomStory } from "@/db/customStories";
import type { CustomStoryParams } from "@/lib/customStories";

export type GenerateResult =
  | { ok: true; title: string; body: string[]; id: string | null }
  | { ok: false };

const TARGET_WORDS = { short: 350, medium: 700, long: 1100 } as const;

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
 * Auth-gated and quota-checked client-side for now; the server-side quota
 * (per account, in DB) lands with full Supabase session management.
 * The /creer page falls back to the local stub if this fails.
 */
export async function generateStoryAction(
  params: CustomStoryParams,
  profileId: string | null = null
): Promise<GenerateResult> {
  const session = await getSession();
  if (!session) return { ok: false };

  const lines = [
    `Écris une histoire pour enfant dont le héros est ${params.heroName}, ${params.heroAge} ans.`,
    params.trait && `Particularité du héros : ${params.trait}.`,
    `Thème : ${params.theme}. Ambiance : ${MOOD_FR[params.mood]}.`,
    params.friend && `Un personnage secondaire apparaît : ${params.friend}.`,
    params.place && `L'histoire se déroule (au moins en partie) ici : ${params.place}.`,
    params.fear &&
      `Le héros surmonte progressivement cette peur au fil de l'histoire : ${params.fear}. Traite-la avec douceur, jamais de façon effrayante.`,
    "Termine sur une note apaisante adaptée au coucher.",
    "N'utilise jamais de tiret cadratin dans le texte.",
  ].filter(Boolean) as string[];

  try {
    const result = await generateStoryText({
      language: params.language,
      ageRange: ageToRange(params.heroAge),
      prompt: lines.join("\n"),
      characters: [
        {
          name: params.heroName,
          description: `héros de l'histoire, ${params.heroAge} ans${params.trait ? `, ${params.trait}` : ""}`,
        },
      ],
      targetWords: TARGET_WORDS[params.length],
    });

    const body = result.scenes.length
      ? result.scenes.map((s) => cleanText(s.text))
      : cleanText(result.fullText).split("\n\n").filter(Boolean);

    const title = cleanText(result.title);

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
        model: result.model,
      });
    } catch (e) {
      console.error("[Lunireve] failed to persist generated story:", e);
    }

    return { ok: true, title, body, id };
  } catch (e) {
    console.error("[Lunireve] story generation failed:", e);
    return { ok: false };
  }
}
