import OpenAI from "openai";
import { env } from "@/lib/env";
import type { ImageProvider } from "../types";

/**
 * OpenAI image provider (gpt-image-1). Used for both library and personalized
 * illustrations by default; Replicate is the swap target for cheaper bulk jobs.
 *
 * Returns a base64 data URL so the caller can upload to Supabase Storage.
 * We don't persist raw URLs from OpenAI — they expire.
 */

const MODEL = "gpt-image-1";

function getClient() {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export const openaiImageProvider: ImageProvider = {
  async generateImage(input) {
    const client = getClient();

    const res = await client.images.generate({
      model: MODEL,
      prompt: input.referenceImageUrl
        ? `${input.prompt}\n\nMatch the character design from this reference: ${input.referenceImageUrl}`
        : input.prompt,
      size: (input.size ?? "1024x1024") as "1024x1024" | "1536x1024" | "1024x1536",
      quality: input.quality === "hd" ? "high" : "medium",
      n: 1,
    });

    const b64 = res.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image data.");

    return {
      imageUrl: `data:image/png;base64,${b64}`,
      model: MODEL,
    };
  },
};
