import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import {
  mockStories,
  GENRES,
  AGE_RANGES,
  DURATION_BUCKETS,
} from "@/data/mock-stories";
import { blogArticles } from "@/data/mock-blog";

/**
 * Regenerate at most hourly: when the n8n pipeline publishes new library
 * stories to the DB they appear here automatically — no redeploy needed.
 */
export const revalidate = 3600;

/**
 * Public sitemap (/sitemap.xml). Lists every crawlable URL for both locales:
 * homepage, library + funnel pages (genre / age / duration), every story,
 * blog index + posts, and the About / FAQ / pricing pages. FR is the default
 * locale (served at the root), EN lives under /en with translated pathnames
 * (see i18n/routing.ts), declared as hreflang alternates so Google links the
 * two language versions. Private app routes are intentionally excluded.
 */
const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://lunireve.com").replace(/\/+$/, "");

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

function entry(
  frPath: string,
  enPath: string,
  priority: number,
  changeFrequency: ChangeFreq,
  lastModified: Date,
): MetadataRoute.Sitemap[number] {
  const fr = `${BASE}${frPath === "/" ? "" : frPath}` || BASE;
  const en = `${BASE}/en${enPath === "/" ? "" : enPath}`;
  return {
    url: fr,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: { fr, en, "x-default": fr } },
  };
}

/** Published library stories from the DB (n8n pipeline output). */
async function dbStoryEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await db
      .select({
        slug: stories.slug,
        language: stories.language,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .where(and(eq(stories.type, "library"), eq(stories.status, "published")));

    return rows.map((s) => {
      const path = s.language === "en" ? `/en/stories/${s.slug}` : `/histoires/${s.slug}`;
      return {
        url: `${BASE}${path}`,
        lastModified: s.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });
  } catch {
    // DB unreachable (e.g. paused project) — the static sitemap still serves.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    entry("/", "/", 1, "daily", now),
    entry("/histoires", "/stories", 0.9, "daily", now),
    entry("/histoires/audio", "/stories/audio", 0.7, "weekly", now),
    entry("/histoire-personnalisee", "/personalised-story", 0.7, "monthly", now),
    entry("/blog", "/blog", 0.8, "weekly", now),
    entry("/faq", "/faq", 0.6, "monthly", now),
    entry("/a-propos", "/about", 0.5, "monthly", now),
    entry("/tarifs", "/pricing", 0.6, "monthly", now),
  ];

  const genrePages = GENRES.map((g) =>
    entry(`/histoires/genre/${g}`, `/stories/genre/${g}`, 0.7, "weekly", now),
  );
  const agePages = AGE_RANGES.map((r) =>
    entry(`/histoires/age/${r}`, `/stories/age/${r}`, 0.7, "weekly", now),
  );
  const durationPages = DURATION_BUCKETS.map((b) =>
    entry(`/histoires/duree/${b}`, `/stories/duration/${b}`, 0.5, "monthly", now),
  );
  const storyPages = mockStories.map((s) =>
    entry(`/histoires/${s.slug}`, `/stories/${s.slug}`, 0.8, "weekly", now),
  );
  // One entry per article in ITS language only — no hreflang alternate until
  // the translated pair actually exists (FR/EN pairs share a baseId in the DB).
  const blogPages: MetadataRoute.Sitemap = blogArticles.map((a) => ({
    url: `${BASE}${a.language === "en" ? `/en/blog/${a.slug}` : `/blog/${a.slug}`}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...genrePages,
    ...agePages,
    ...durationPages,
    ...storyPages,
    ...blogPages,
    ...(await dbStoryEntries(now)),
  ];
}
