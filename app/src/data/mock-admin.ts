import { mockStories, ageLabel, durationBucket, type AgeRange, type Genre, type DurationBucket } from "./mock-stories";

/**
 * Admin mock data — deterministic numbers derived from the story list so the
 * UI looks alive. Phase 2 replaces every export with Drizzle aggregates.
 */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: "free";
  children: number;
  customStories: number;
  signedUpAt: string;
  status: "active" | "disabled";
};

/** Real users only (decision #22) — empty until Supabase Auth signups land. */
export const mockUsers: AdminUser[] = [];

export type Submission = {
  id: string;
  title: string;
  author: string;
  ageRange: string;
  theme: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
};

export const mockSubmissions: Submission[] = [
  { id: "s1", title: "Le hérisson qui voulait voler", author: "Camille Lefèvre", ageRange: "3-4", theme: "courage", submittedAt: "2026-06-05", status: "pending" },
  { id: "s2", title: "Une sorcière à l'école", author: "Aïcha Benali", ageRange: "7-8", theme: "humour", submittedAt: "2026-06-07", status: "pending" },
];

export type Report = {
  id: string;
  storySlug: string;
  storyTitle: string;
  type: "story" | "image";
  reason: string;
  comment: string;
  reportedBy: string;
  reportedAt: string;
  status: "open" | "reviewing" | "resolved";
};

export const mockReports: Report[] = [
  { id: "r1", storySlug: "le-gateau-qui-ne-voulait-pas-cuire", storyTitle: "Le gâteau qui ne voulait pas cuire", type: "story", reason: "Erreur dans le texte", comment: "Une phrase est répétée deux fois au chapitre 2.", reportedBy: "camille.l@example.fr", reportedAt: "2026-06-06", status: "open" },
  { id: "r2", storySlug: "timothee-et-le-dragon-timide", storyTitle: "Timothée et le dragon timide", type: "image", reason: "Qualité insuffisante", comment: "L'illustration est floue sur mobile.", reportedBy: "t.garnier@example.fr", reportedAt: "2026-06-08", status: "reviewing" },
  { id: "r3", storySlug: "la-course-des-etoiles-filantes", storyTitle: "La course des étoiles filantes", type: "story", reason: "Autre", comment: "", reportedBy: "anonyme", reportedAt: "2026-06-10", status: "resolved" },
];

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  publishedAt: string | null;
  views: number;
};

export const mockBlogPosts: BlogPost[] = [
  { id: "b1", title: "5 histoires pour apprivoiser la peur du noir", slug: "peur-du-noir", status: "published", publishedAt: "2026-05-20", views: 1240 },
  { id: "b2", title: "Pourquoi lire à voix haute change tout", slug: "lire-a-voix-haute", status: "published", publishedAt: "2026-06-02", views: 860 },
  { id: "b3", title: "Écrans le soir : que dit la science ?", slug: "ecrans-le-soir", status: "draft", publishedAt: null, views: 0 },
];

export type StoryAnalytics = {
  slug: string;
  title: string;
  // Story attributes (real metadata — drives the per-story filter columns).
  ageRange: AgeRange;
  genre: Genre;
  duration: DurationBucket;
  hasAudio: boolean;
  interactive: boolean;
  // Metrics — REAL data only (zero until events are recorded).
  opens: number;
  readPct: number; // avg % read
  completionRate: number; // % readers reaching 90%
  audioPlays: number;
  favorites: number;
  avgRating: number;
  shares: number;
  reports: number;
  // Readership gender split (analytics) — zero until real events land.
  readersGirlPct: number;
  readersBoyPct: number;
};

/** "short" → "Court", etc. (per-story duration column label). */
export const DURATION_LABEL: Record<DurationBucket, string> = {
  short: "Court",
  medium: "Moyen",
  long: "Long",
};

/** Human label for an age range, e.g. "5-6" → "5–6 ans". */
export { ageLabel };

/**
 * Per-story analytics — REAL data only (user decision #22). Story attributes
 * (age, genre, duration, audio, interactive) are real metadata so the table
 * stays filterable from day one; every measured metric is zero until actual
 * events are recorded. Phase 2 replaces this with SQL aggregates over the
 * events table.
 */
export const storyAnalytics: StoryAnalytics[] = mockStories.map((s) => ({
  slug: s.slug,
  title: s.title,
  ageRange: s.ageRange,
  genre: s.genre,
  duration: durationBucket(s.readingMinutes),
  hasAudio: s.hasAudio,
  interactive: s.interactive,
  opens: 0,
  readPct: 0,
  completionRate: 0,
  audioPlays: 0,
  favorites: 0,
  avgRating: s.rating,
  shares: 0,
  reports: 0,
  readersGirlPct: 0,
  readersBoyPct: 0,
}));

/** Real values only. Pre-launch: zeros everywhere except published stories. */
export const globalKpis = {
  totalUsers: 0,
  activeUsers30d: 0,
  newUsers7d: 0,
  paidUsers: 0,
  childProfiles: 0,
  avgSessionMin: 0,
  accountConversionPct: 0,
  newsletterSignups: 0,
  storiesPublished: mockStories.length,
  customStoriesCreated: 0,
  topPersonalizationTheme: "-",
  topPersonalizationCharacter: "-",
  pendingSubmissions: mockSubmissions.filter((s) => s.status === "pending").length,
  openReports: mockReports.filter((r) => r.status === "open").length,
};

export const DATE_RANGES = ["7", "15", "30", "60", "90", "180", "360", "all"] as const;
