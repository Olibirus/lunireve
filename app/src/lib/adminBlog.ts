"use client";

import { blogArticles, type BlogArticle } from "@/data/mock-blog";

/**
 * Admin blog store (#13) — a working CMS-lite. localStorage now, seeded from
 * the public articles; Phase 2 swaps these functions for Supabase queries
 * against blog_posts. The editor reads/writes BlogArticle directly, so the
 * public blog and the CMS share one shape.
 */

const KEY = "lunireve:adminBlog";
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

export type AdminArticle = BlogArticle & { status: "draft" | "published" };

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
