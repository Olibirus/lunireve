import type { CustomStoryParams } from "@/lib/customStories";

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
  character?: string
): string {
  return [
    `${STYLE_PROMPT[style]}.`,
    character ? `Main character (consistent in every image): ${character}.` : "",
    `Scene: ${scenePrompt}.`,
    "One cohesive scene with a single centered focal subject and comfortable margins (crops well to square, portrait or wide).",
    "Children's storybook mood, warm and reassuring. No text, no letters, no logos, no frames, no split panels.",
  ]
    .filter(Boolean)
    .join(" ");
}
