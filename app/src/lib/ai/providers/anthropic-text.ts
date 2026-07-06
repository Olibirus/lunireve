import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import {
  WORD_RANGE_BY_AGE,
  endsWithMoral,
  SAFETY_RULES,
  type TextProvider,
  type StoryGenerationInput,
  type StoryGenerationOutput,
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

  // Length is age-driven (see WORD_RANGE_BY_AGE). A single global word count is
  // unreliable (the model undershoots), so we translate it into a firm scene
  // count with a per-scene word target — concrete, easy-to-hit instructions.
  const { min, max, target } = WORD_RANGE_BY_AGE[input.ageRange];
  const sceneCount =
    target <= 200 ? 5 : target <= 500 ? 7 : target <= 800 ? 9 : target <= 1200 ? 11 : 13;
  const perScene = Math.ceil(target / sceneCount);

  const moral = input.language === "fr"
    ? "Termine la dernière scène par une morale douce, en une phrase, qui découle naturellement du thème de l'histoire."
    : "End the final scene with a gentle one-sentence moral that follows naturally from the story's theme.";

  return `${voice}
${SAFETY_RULES}
Age range: ${input.ageRange}. ${ageGuidance}
Length requirement (STRICT, non-negotiable):
- Write EXACTLY ${sceneCount} scenes.
- Each scene must be a full paragraph of about ${perScene} words (never fewer than ${Math.floor(perScene * 0.8)}).
- The complete story must total between ${min} and ${max} words (aim for ${target}).
- Do NOT end the story before all ${sceneCount} scenes are written at full length. Short, clipped scenes are a failure.
${endsWithMoral(input.ageRange) ? moral : ""}
${input.seoKeyword ? `Weave the phrase "${input.seoKeyword}" naturally into the story.` : ""}
${input.characters?.length ? `Characters to use consistently: ${input.characters.map((c) => `${c.name} (${c.description})`).join("; ")}.` : ""}

Return ONLY valid JSON matching this TypeScript type, nothing else:
{
  "title": string,
  "scenes": Array<{ "text": string, "imagePrompt": string }>,
  "glossary": Array<{ "word": string, "definition": string }>
}
The "imagePrompt" for each scene should be a vivid English prompt describing the scene's visual — style, composition, mood — ready to feed to an image model.
The "glossary" lists ONLY the genuinely difficult words you actually used (0 to 5), each with a one-sentence definition a child of this age understands, in the story's language. Empty array if none.`;
}

function getClient() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

type ParsedStory = {
  title: string;
  scenes: Array<{ text: string; imagePrompt: string }>;
  glossary?: Array<{ word: string; definition: string }>;
};

export const anthropicTextProvider: TextProvider = {
  async generateStory(input) {
    const client = getClient();
    const { min, max } = WORD_RANGE_BY_AGE[input.ageRange];

    async function callOnce(extraInstruction?: string): Promise<ParsedStory> {
      const res = await client.messages.create({
        model: MODEL,
        // Headroom for the longest ages (~2,100 words + per-scene image prompts,
        // in JSON) which overflow 4096.
        max_tokens: 8192,
        system: buildSystemPrompt(input),
        messages: [
          {
            role: "user",
            content: extraInstruction ? `${input.prompt}\n\n${extraInstruction}` : input.prompt,
          },
        ],
      });

      const textBlock = res.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Anthropic returned no text block.");
      }

      // Strip any accidental code fence wrapping.
      const raw = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
      try {
        return JSON.parse(raw) as ParsedStory;
      } catch {
        throw new Error(`Anthropic returned invalid JSON:\n${raw.slice(0, 500)}`);
      }
    }

    let parsed = await callOnce();
    let fullText = parsed.scenes.map((s) => s.text).join("\n\n");

    // Length enforcement: the age-driven word range is a product rule (same for
    // personalized stories, the library pipeline and everything future). If the
    // model drifts outside the band, retry once with a corrective instruction.
    const words = fullText.split(/\s+/).filter(Boolean).length;
    if (words < min * 0.85 || words > max * 1.2) {
      const fix =
        words < min
          ? `IMPORTANT: your previous draft was only ${words} words, which is too short. The story MUST be between ${min} and ${max} words. Rewrite it at full length.`
          : `IMPORTANT: your previous draft was ${words} words, which is too long. The story MUST be between ${min} and ${max} words. Rewrite it tighter.`;
      try {
        parsed = await callOnce(fix);
        fullText = parsed.scenes.map((s) => s.text).join("\n\n");
      } catch {
        /* keep the first draft rather than failing the whole generation */
      }
    }

    return {
      title: parsed.title,
      scenes: parsed.scenes,
      fullText,
      glossary: Array.isArray(parsed.glossary) ? parsed.glossary.slice(0, 5) : [],
      model: MODEL,
    } satisfies StoryGenerationOutput;
  },
};
