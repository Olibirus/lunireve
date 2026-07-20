import type { CustomStoryParams } from "@/lib/customStories";
import { relationLabel } from "@/lib/storyOptions";

/** Relations that share the hero's species when the hero is an animal. */
const FAMILY_RELATIONS = new Set([
  "frere",
  "soeur",
  "papa",
  "maman",
  "grandpere",
  "grandmere",
  "cousin",
  "cousine",
]);

/**
 * Which secondary characters must appear in the illustration, and how they
 * relate to the hero. When the hero is an animal, family members are tagged as
 * the SAME kind of animal (a horse's brother is a horse), so the picture stays
 * logically consistent; friends may stay a different species.
 */
export function imageCast(
  params: Pick<CustomStoryParams, "heroType" | "heroName" | "companions" | "friend">
): string {
  const heroIsAnimal = params.heroType === "animal";
  const companions = (params.companions ?? []).filter((c) => c.name?.trim().length);
  if (companions.length) {
    return companions
      .map((c) => {
        const rel = relationLabel(c.relation, "en");
        const sameSpecies = heroIsAnimal && FAMILY_RELATIONS.has(c.relation);
        return `${c.name.trim()} (${rel}${
          sameSpecies ? `, the same kind of animal as ${params.heroName}` : ""
        })`;
      })
      .join(", ");
  }
  return params.friend?.trim() ?? "";
}

/**
 * Illustration style (#15) → image-model prompt prefix. Single source of truth
 * for every place that renders a personalized illustration (server action,
 * n8n pipeline, test scripts). Descriptors are deliberately rich: thin
 * one-liners produce generic "AI storybook" output, while medium/texture/light
 * words steer the model toward a recognizable craft.
 */
export const STYLE_PROMPT: Record<CustomStoryParams["style"], string> = {
  automatique:
    "warm children's picture-book illustration, soft painterly gouache texture, gentle bedtime palette, cozy candle-like highlights, hand-illustrated feel",
  aquarelle:
    "delicate watercolor children's book illustration, wet-on-wet washes, soft pigment blooms, visible paper grain, airy negative space, light pencil underdrawing",
  bd:
    "European bande dessinée children's style, confident clean ink outlines, flat vivid colors, simple expressive faces, ligne claire tradition",
  anime3d:
    "high-quality 3D animated family-film still, soft global illumination, rounded shapes, expressive big eyes, shallow depth of field, warm rim light",
  crayons:
    "colored-pencil children's illustration, visible layered strokes, waxy texture, hand-drawn wobble in the lines, paper tooth showing through",
  kawaii:
    "kawaii chibi children's illustration, oversized sparkly eyes, tiny rounded bodies, soft pastel palette, gentle blush cheeks, simple clean background",
  vif:
    "bold vibrant children's illustration for toddlers, saturated primary colors, thick playful shapes, high contrast, joyful energy, candy-bright palette, simple friendly forms",
};

/**
 * Compose the final prompt for a personalized story illustration.
 * `character` is the hero's visual identity (name, age, type, skin tone...):
 * repeating it keeps the child recognizable across every render.
 */
export function personalizedImagePrompt(
  style: CustomStoryParams["style"],
  scenePrompt: string,
  character?: string,
  cast?: string
): string {
  return [
    `${STYLE_PROMPT[style]}.`,
    character ? `Main character (consistent in every image): ${character}.` : "",
    cast
      ? `Also show, together in the same scene and arranged naturally where it makes sense: ${cast}.`
      : "",
    `Scene: ${scenePrompt}.`,
    "If the main character is an animal, its family members are the same kind of animal as the main character; friends may be a different species.",
    "One cohesive scene with a single centered focal subject and comfortable margins (crops well to square, portrait or wide).",
    "Children's storybook mood, warm and reassuring. Absolutely no text anywhere: no letters, words, numbers, captions, speech bubbles, signs, labels or logos. No frames, no split panels.",
  ]
    .filter(Boolean)
    .join(" ");
}
