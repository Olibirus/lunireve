import "server-only";
import { getSupabaseAdminClient } from "./admin";

/**
 * Supabase Storage helper for AI-generated assets.
 *
 * Everything generative (cover/inline images, lazy TTS audio) lands here. The
 * provider layer returns raw bytes or a short-lived hosted URL; we persist the
 * bytes to a public bucket and keep only the stable Supabase URL on the story
 * row. OpenAI image URLs expire and Replicate output URLs are temporary, so we
 * never store a provider URL directly.
 *
 * Uses the service-role client: uploads bypass RLS (asset writes are a
 * server-side, trusted operation triggered by generation, not by the browser).
 */

export const STORAGE_BUCKETS = {
  /** Story cover + inline illustrations. */
  images: "story-images",
  /** Lazy-generated narration, cached after first listen. */
  audio: "story-audio",
  /** Stylized character reference sheets (originals are deleted post-gen). */
  characters: "character-references",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Turn whatever the image provider returned into raw bytes.
 * Providers hand back either a `data:` URL (OpenAI, base64) or an http(s) URL
 * (Replicate). Audio providers already return a Buffer, so this is image-only.
 */
export async function fetchToBuffer(urlOrDataUrl: string): Promise<Buffer> {
  if (urlOrDataUrl.startsWith("data:")) {
    const base64 = urlOrDataUrl.split(",", 2)[1] ?? "";
    if (!base64) throw new Error("Malformed data URL: no base64 payload.");
    return Buffer.from(base64, "base64");
  }
  const res = await fetch(urlOrDataUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch asset (${res.status}) from ${urlOrDataUrl}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Upload bytes to a public bucket and return the stable public URL.
 * `upsert` is on: regenerating a story's asset overwrites the cached copy at
 * the same deterministic path instead of orphaning the old one.
 */
export async function uploadAsset(
  bucket: StorageBucket,
  path: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Storage upload to ${bucket}/${path} failed: ${error.message}`);
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!pub?.publicUrl) {
    throw new Error(`Could not resolve public URL for ${bucket}/${path}.`);
  }
  return pub.publicUrl;
}
