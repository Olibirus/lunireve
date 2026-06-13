"use client";

import { blogArticles, type BlogArticle } from "@/data/mock-blog";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Admin blog store (#13) — a working CMS-lite. localStorage now, seeded from
 * the public articles; Phase 2 swaps these functions for Supabase queries
 * against blog_posts. The editor reads/writes BlogArticle directly, so the
 * public blog and the CMS share one shape.
 */

const KEY = "lunireve:adminBlog";

/** Supabase Storage bucket for blog imagery (#7). Create it public in Supabase. */
export const BLOG_BUCKET = "blog";

export type UploadResult = { url: string; fallback: boolean };

/**
 * Upload an image to Supabase Storage and return its public URL (#7).
 * If Supabase isn't configured yet (no env vars) or the upload fails, we fall
 * back to an inline data URL so the editor still works in the local demo. The
 * caller can surface `fallback: true` to warn that the image is not yet on the
 * CDN. Phase 2: enforce server-side validation + the `blog_posts` swap.
 */
export async function uploadBlogImage(file: File): Promise<UploadResult> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage
      .from(BLOG_BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, fallback: false };
  } catch {
    return { url: await fileToDataUrl(file), fallback: true };
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
const COVERS = [
  "cover-dusk",
  "cover-meadow",
  "cover-peach",
  "cover-indigo",
  "cover-mint",
  "cover-night",
  "cover-sand",
  "cover-sea",
] as const;
export const COVER_OPTIONS = COVERS;

export type AdminArticle = BlogArticle & {
  status: "draft" | "published";
  /**
   * Uploaded cover image (Supabase Storage public URL or data-URL fallback).
   * Takes precedence over the `cover` gradient class when set. Mirrors
   * `blog_posts.cover_image_url`; the public blog adopts it at the DB swap.
   */
  coverImageUrl?: string;
};

function seed(): AdminArticle[] {
  return blogArticles.map((a) => ({ ...a, status: "published" as const }));
}

export function readArticles(): AdminArticle[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = seed();
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as AdminArticle[];
  } catch {
    return seed();
  }
}

function write(items: AdminArticle[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* non-fatal */
  }
}

export function getArticle(slug: string): AdminArticle | undefined {
  return readArticles().find((a) => a.slug === slug);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Parse a markdown-lite body ("## Heading\n\nparagraph\n\nparagraph") into sections. */
export function parseSections(raw: string): BlogArticle["sections"] {
  const blocks = raw.split(/\n(?=##\s)/);
  return blocks
    .map((block) => {
      const lines = block.trim().split("\n");
      const heading = lines[0].replace(/^##\s*/, "").trim();
      const paragraphs = lines
        .slice(1)
        .join("\n")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      return { heading, paragraphs };
    })
    .filter((s) => s.heading || s.paragraphs.length);
}

/** Serialize sections back to the editor textarea format. */
export function sectionsToRaw(sections: BlogArticle["sections"]): string {
  return sections
    .map((s) => `## ${s.heading}\n\n${s.paragraphs.join("\n\n")}`)
    .join("\n\n");
}

export function saveArticle(article: AdminArticle, originalSlug?: string) {
  const all = readArticles();
  const idx = originalSlug ? all.findIndex((a) => a.slug === originalSlug) : -1;
  if (idx >= 0) all[idx] = article;
  else all.unshift(article);
  write(all);
}

export function deleteArticle(slug: string) {
  write(readArticles().filter((a) => a.slug !== slug));
}
