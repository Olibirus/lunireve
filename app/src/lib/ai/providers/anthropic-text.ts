import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import type {
  TextProvider,
  StoryGenerationInput,
  StoryGenerationOutput,
} from "../types";

/**
 * Anthropic text provider. Primary choice: Claude writes warmer, more natural
 * children's prose in French than GPT-4 in our tests.
 *
 * We ask the model to return JSON directly — cheaper and more reliable than
 * parsing free-form output. If it drifts off-schema, we retry once with a
 * stricter reminder before bubbling the error.
 */

const MODEL = "claude-sonnet-4-6";

function buildSystemPrompt(input: StoryGenerationInput) {
  const voice =
    input.language === "fr"
      ? "Tu es un·e auteur·rice de contes pour enfants. Écris en français naturel, chaleureux, adapté aux enfants."
      : "You are a children's storybook author. Write in warm, natural English suited to young children.";

  const ageGuidance = {
    "1-2": "A few words per sentence. Sounds, rhythm, repetition. Naming familiar things.",
    "3-4": "Very short sentences. Concrete images. Repetition is your friend.",
    "5-6": "Short sentences. Simple vocabulary. A clear, single-thread plot.",
    "7-8": "Short sentences. Simple vocabulary. Clear cause and effect.",
    "9-10": "Richer vocabulary and slight complexity, but still read-aloud friendly.",
    "11-12": "Layered plot and richer vocabulary; respect the reader's intelligence.",
  }[input.ageRange];

  const target = input.targetWords ?? 600;
  // Firm range — the model otherwise treats "~N words" as a ceiling and stops
  // well short (a 700-word target came back at ~330).
  const min = Math.round(target * 0.85);
  const max = Math.round(target * 1.2);

  return `${voice}
Age range: ${input.ageRange}. ${ageGuidance}
Length requirement (strict): write between ${min} and ${max} words TOTAL, aiming for ${target}. This is a hard minimum, not a suggestion: keep developing the story until you reach it. Do not stop short. Split into 6-10 scenes.
${input.seoKeyword ? `Weave the phrase "${input.seoKeyword}" naturally into the story.` : ""}
${input.characters?.length ? `Characters to use consistently: ${input.characters.map((c) => `${c.name} (${c.description})`).join("; ")}.` : ""}

Return ONLY valid JSON matching this TypeScript type, nothing else:
{
  "title": string,
  "scenes": Array<{ "text": string, "imagePrompt": string }>
}
The "imagePrompt" for each scene should be a vivid English prompt describing the scene's visual — style, composition, mood — ready to feed to an image model.`;
}

function getClient() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export const anthropicTextProvider: TextProvider = {
  async generateStory(input) {
    const client = getClient();

    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: buildSystemPrompt(input),
      messages: [{ role: "user", content: input.prompt }],
    });

    const textBlock = res.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Anthropic returned no text block.");
    }

    // Strip any accidental code fence wrapping.
    const raw = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");

    let parsed: { title: string; scenes: Array<{ text: string; imagePrompt: string }> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Anthropic returned invalid JSON:\n${raw.slice(0, 500)}`);
    }

    const fullText = parsed.scenes.map((s) => s.text).join("\n\n");

    return {
      title: parsed.title,
      scenes: parsed.scenes,
      fullText,
      model: MODEL,
    } satisfies StoryGenerationOutput;
  },
};
