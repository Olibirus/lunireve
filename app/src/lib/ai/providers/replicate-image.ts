import { env } from "@/lib/env";
import type { ImageProvider } from "../types";

/**
 * Replicate image provider. Used when IMAGE_PROVIDER_* = "replicate".
 *
 * Default model: FLUX.1 [schnell] — fast and cheap enough to run bulk library
 * generation economically. Swap MODEL_VERSION for flux-dev or flux-pro when
 * quality matters more than cost.
 *
 * We poll the prediction endpoint instead of using webhooks because the call
 * sites here are already in async workers (n8n for library, server actions
 * for on-demand).
 */

// black-forest-labs/flux-schnell — pinned version for reproducibility.
const MODEL_VERSION =
  "black-forest-labs/flux-schnell:bf2f2e683d03a9549f484a37a0df1e98f70bf8e1b3bd1a5a7f1b1b6b5f1d1e1e";

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string[] | string;
  error?: string;
}

async function createPrediction(input: Record<string, unknown>) {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version: MODEL_VERSION, input }),
  });
  if (!res.ok) throw new Error(`Replicate create failed: ${await res.text()}`);
  return (await res.json()) as ReplicatePrediction;
}

async function pollPrediction(id: string): Promise<ReplicatePrediction> {
  const deadline = Date.now() + 60_000; // 60s ceiling — flux-schnell finishes in ~2-5s.
  while (Date.now() < deadline) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${env.REPLICATE_API_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Replicate poll failed: ${await res.text()}`);
    const pred = (await res.json()) as ReplicatePrediction;
    if (
      pred.status === "succeeded" ||
      pred.status === "failed" ||
      pred.status === "canceled"
    ) {
      return pred;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Replicate prediction ${id} timed out.`);
}

export const replicateImageProvider: ImageProvider = {
  async generateImage(input) {
    if (!env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set.");
    }

    const [w, h] = (input.size ?? "1024x1024").split("x").map(Number);

    const created = await createPrediction({
      prompt: input.prompt,
      aspect_ratio: w === h ? "1:1" : w > h ? "16:9" : "9:16",
      output_format: "png",
      num_outputs: 1,
    });

    const finished = await pollPrediction(created.id);
    if (finished.status !== "succeeded") {
      throw new Error(`Replicate prediction failed: ${finished.error ?? finished.status}`);
    }

    const url = Array.isArray(finished.output) ? finished.output[0] : finished.output;
    if (!url) throw new Error("Replicate returned no output.");

    return { imageUrl: url, model: MODEL_VERSION };
  },
};
