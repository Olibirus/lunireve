import type { CustomStoryParams } from "@/lib/customStories";

/**
 * Illustration style (#15) → image-model prompt prefix. Single source of truth
 * for every place that renders a personalized illustration (server action,
 * n8n pipeline, test scripts).
 */
export const STYLE_PROMPT: Record<CustomStoryParams["style"], string> = {
  automatique: "warm, soft children's book illustration",
  aquarelle: "soft watercolor children's book illustration, gentle washes",
  bd: "clean comic-book / bande dessinée style, bold outlines, flat colors",
  anime3d: "cute 3D animated film style, soft lighting, Pixar-like",
  crayons: "colored-pencil crayon children's illustration, textured strokes",
  kawaii: "kawaii chibi children's illustration, big eyes, pastel palette",
};

/** Compose the final prompt for a personalized story illustration. */
export function personalizedImagePrompt(
  style: CustomStoryParams["style"],
  scenePrompt: string
): string {
  return `${STYLE_PROMPT[style]}. Scene: ${scenePrompt}. Children's storybook, warm palette, no text, no letters.`;
}
