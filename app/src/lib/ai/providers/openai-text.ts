import OpenAI from "openai";
import { env } from "@/lib/env";
import type {
  TextProvider,
  StoryGenerationInput,
  StoryGenerationOutput,
} from "../types";

/**
 * OpenAI text provider. Fallback / A/B alternative to Anthropic. Uses
 * structured outputs via json_schema response format — no hand-rolled
 * parsing needed.
 */

const MODEL = "gpt-4o-2024-11-20";

function getClient() {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export const openaiTextProvider: TextProvider = {
  async generateStory(input) {
    const client = getClient();

    const systemPrompt =
      input.language === "fr"
        ? "Tu es un·e auteur·rice de contes pour enfants francophone."
        : "You are an English-language children's storybook author.";

    const userPrompt = [
      `Age: ${input.ageRange}. Target ~${input.targetWords ?? 600} words, 6-10 scenes.`,
      input.seoKeyword ? `Weave the phrase "${input.seoKeyword}" naturally.` : "",
      input.characters?.length
        ? `Characters: ${input.characters.map((c) => `${c.name} (${c.description})`).join("; ")}.`
        : "",
      `Brief: ${input.prompt}`,
      `Each scene's imagePrompt should be a vivid English description, ready for an image model.`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "story",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    text: { type: "string" },
                    imagePrompt: { type: "string" },
                  },
                  required: ["text", "imagePrompt"],
                },
              },
            },
            required: ["title", "scenes"],
          },
        },
      },
    });

    const content = res.choices[0]?.message.content;
    if (!content) throw new Error("OpenAI returned no content.");

    const parsed = JSON.parse(content) as {
      title: string;
      scenes: Array<{ text: string; imagePrompt: string }>;
    };

    return {
      title: parsed.title,
      scenes: parsed.scenes,
      fullText: parsed.scenes.map((s) => s.text).join("\n\n"),
      model: MODEL,
    } satisfies StoryGenerationOutput;
  },
};
