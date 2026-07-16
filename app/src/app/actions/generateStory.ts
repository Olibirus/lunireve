"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { generateStoryText, generateImage } from "@/lib/ai";
import { personalizedImagePrompt } from "@/lib/ai/stylePrompts";
import { STORAGE_BUCKETS, fetchToBuffer, uploadAsset } from "@/lib/supabase/storage";
import { moderateStoryFields, moderateGeneratedStory } from "@/lib/ai/safetyGate";
import { getSession } from "@/lib/auth/session";
import { ageToRange } from "@/data/mock-stories";
import { insertCustomStory, selectCustomStoryImageInputs } from "@/db/customStories";
import { moderateStoryParams } from "@/lib/moderation";
import {
  HERO_TYPES,
  FREE_HERO_MAX_AGE,
  MAX_COMPANIONS,
  MAX_EXTRA_INFO,
  relationLabel,
  heroTypeLabel,
  capitalizeName,
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
  | {
      ok: false;
      reason?: "moderation" | "error";
      /** Offending form field when moderation blocked (heroName, trait,
          subTheme, place, fear, companions, extraInfo). Absent when the
          rejection came from the generated output. */
      field?: string;
    };

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

  // Normalize per-item field ids (companion2, extraInfo1) to their form field.
  const uiField = (f: string) =>
    f.startsWith("companion") ? "companions" : f.startsWith("extraInfo") ? "extraInfo" : f;

  // 2a — blocklist wall (free, instant). No fallback story for this one.
  const check = moderateStoryParams(params);
  if (!check.ok) {
    console.warn(
      `[Lunireve] story input blocked (${check.field}: ${check.reason}) for ${session.username}`
    );
    return { ok: false, reason: "moderation", field: uiField(check.field) };
  }

  // 2b — semantic wall: multilingual, intent-aware classification of every
  // free-text field (slang, other languages, innocent-words-bad-intent all
  // score here where the blocklist cannot see them).
  const semantic = await moderateStoryFields([
    { field: "heroName", text: params.heroName },
    { field: "trait", text: params.trait },
    { field: "heroDescription", text: params.heroDescription ?? "" },
    { field: "subTheme", text: params.subTheme ?? "" },
    { field: "moral", text: params.moral ?? "" },
    { field: "place", text: params.place },
    { field: "fear", text: params.fear },
    { field: "friend", text: params.friend },
    ...(params.companions ?? []).map((c, i) => ({
      field: `companion${i + 1}`,
      text: c.name,
    })),
    ...(params.extraInfo ?? []).map((info, i) => ({
      field: `extraInfo${i + 1}`,
      text: info,
    })),
  ]);
  if (!semantic.ok) {
    console.warn(
      `[Lunireve] story input blocked by safety gate (${semantic.field}: ${semantic.category}) for ${session.username}`
    );
    return { ok: false, reason: "moderation", field: uiField(semantic.field) };
  }

  // 3 — tier clamps (quietly cap instead of failing: the UI already prevents
  // this, so anything arriving here is a bypass attempt or a stale client).
  const tier = session.tier ?? "free";
  if (tier === "free") {
    if (params.heroAge > FREE_HERO_MAX_AGE) params.heroAge = FREE_HERO_MAX_AGE;
    const heroType = HERO_TYPES.find((h) => h.id === params.heroType);
    if (heroType && !heroType.free) params.heroType = "garcon";
  }

  // Names always render with proper capitals in the story, whatever the
  // parent typed ("jean-luc" -> "Jean-Luc").
  params.heroName = capitalizeName(params.heroName);
  const companions = (params.companions ?? [])
    .filter((c) => c.name.trim().length >= 2)
    .map((c) => ({ ...c, name: capitalizeName(c.name) }))
    .slice(0, MAX_COMPANIONS);
  const extraInfo = (params.extraInfo ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_EXTRA_INFO);
  const readingAge = params.readingAge ?? params.heroAge;
  const heroKind = heroTypeLabel(params.heroType, "fr").toLowerCase();
  // A saved character's full description wins over the short trait field.
  const heroDetail = params.heroDescription?.trim() || params.trait;

  const lines = [
    `Écris une histoire pour enfant dont le héros est « ${params.heroName} », ${params.heroAge} ans${heroKind ? ` (${heroKind})` : ""}.`,
    params.sequelOf &&
      `IMPORTANT : cette histoire est l'ÉPISODE SUIVANT de « ${params.sequelOf} ». Garde le même héros et les mêmes personnages, fais un bref clin d'œil à l'aventure précédente au début, mais invente une intrigue NOUVELLE et clairement différente.`,
    heroDetail && `Particularité du héros : « ${heroDetail} ».`,
    `Thème : ${params.theme}${params.subTheme ? ` (angle précis : « ${params.subTheme} »)` : ""}. Ambiance : ${MOOD_FR[params.mood]}.`,
    // Appearance and traits must colour the story, never be recited as a list
    // ("Il avait six ans. Sa peau était claire. Il n'avait pas de lunettes.").
    "IMPORTANT : intègre l'apparence et le caractère des personnages par petites touches naturelles au fil du récit (un geste, un détail, une réaction). N'énumère JAMAIS leurs attributs sous forme de liste ou de phrases descriptives successives.",
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
    params.moral &&
      `MORALE DEMANDÉE : l'histoire doit se conclure naturellement sur cette leçon : « ${params.moral} ». Elle doit découler des événements, jamais être plaquée.`,
    "Inclus quelques dialogues courts entre les personnages, entre guillemets « », comme dans les histoires de la bibliothèque.",
    "Termine sur une note apaisante adaptée au coucher.",
    "N'utilise jamais de tiret cadratin dans le texte.",
  ].filter(Boolean) as string[];

  // ---- Illustration, IN PARALLEL with the text (it is the slowest step). ----
  // The cover only needs the hero + theme (not the story text), so it starts
  // now; after the row is inserted we upload and attach it. Any failure here
  // is silent: the lazy ensureCustomStoryImage path still covers first view.
  const heroKindEn =
    params.heroType === "fille" ? "girl" : params.heroType === "animal" ? "animal" : params.heroType === "adulte" ? "adult" : "boy";
  const toneEn =
    params.skinTone === "claire" ? "light skin" : params.skinTone === "mate" ? "tan skin" : params.skinTone === "foncee" ? "dark skin" : "";
  const characterSheet = `${params.heroName}, a ${params.heroAge}-year-old ${heroKindEn}${toneEn ? `, ${toneEn}` : ""}${heroDetail ? `, ${heroDetail}` : ""}`;
  const imagePromise: Promise<string | null> = (async () => {
    let referenceImageUrl: string | undefined;
    if (params.sequelOfId) {
      const prev = await selectCustomStoryImageInputs(params.sequelOfId).catch(() => null);
      referenceImageUrl = prev?.heroImageUrl ?? undefined;
    }
    const out = await generateImage("personalized", {
      prompt: personalizedImagePrompt(
        params.style,
        `hero ${params.heroName}, theme ${params.theme}${params.subTheme ? ` (${params.subTheme})` : ""}${params.place ? `, set in ${params.place}` : ""}, night-time bedtime cover illustration`,
        characterSheet
      ),
      referenceImageUrl,
      size: "1024x1024",
    });
    return out.imageUrl;
  })().catch((e) => {
    console.warn("[Lunireve] parallel cover generation failed:", e);
    return null;
  });

  try {
    const result = await generateStoryText({
      language: params.language,
      ageRange: ageToRange(readingAge),
      prompt: lines.join("\n"),
      characters: [
        {
          name: params.heroName,
          description: `héros de l'histoire, ${params.heroAge} ans${heroKind ? `, ${heroKind}` : ""}${heroDetail ? `, ${heroDetail}` : ""}${params.skinTone ? `, peau ${params.skinTone}` : ""}`,
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

    // 4 — final verification: scan the GENERATED text before storing or
    // showing it. Catches the rare case where something slipped past the
    // input gates and the prompt rules.
    const outputCheck = await moderateGeneratedStory(
      [title, ...body].join("\n\n")
    );
    if (!outputCheck.ok) {
      console.error(
        `[Lunireve] generated story blocked by safety gate (${outputCheck.category}) for ${session.username}`
      );
      return { ok: false, reason: "moderation" };
    }

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
        // Scene-1 visual brief — consumed by the lazy illustration action.
        imagePrompt: result.scenes[0]?.imagePrompt || undefined,
      });
    } catch (e) {
      console.error("[Lunireve] failed to persist generated story:", e);
    }

    // Attach the parallel cover (usually already resolved: text is slower).
    if (id) {
      try {
        const providerUrl = await imagePromise;
        if (providerUrl) {
          const bytes = await fetchToBuffer(providerUrl);
          const url = await uploadAsset(
            STORAGE_BUCKETS.images,
            `${id}/hero.png`,
            bytes,
            "image/png"
          );
          await db
            .update(stories)
            .set({ heroImageUrl: url, updatedAt: new Date() })
            .where(eq(stories.id, id));
        }
      } catch (e) {
        console.warn("[Lunireve] cover attach failed (lazy path will retry):", e);
      }
    }

    return { ok: true, title, body, glossary, id };
  } catch (e) {
    console.error("[Lunireve] story generation failed:", e);
    return { ok: false, reason: "error" };
  }
}
