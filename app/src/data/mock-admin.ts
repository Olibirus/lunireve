import { mockStories } from "./mock-stories";

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

export const mockUsers: AdminUser[] = [
  { id: "u1", name: "Camille Lefèvre", email: "camille.l@example.fr", plan: "free", children: 1, customStories: 3, signedUpAt: "2026-05-02", status: "active" },
  { id: "u2", name: "Thomas Garnier", email: "t.garnier@example.fr", plan: "free", children: 1, customStories: 1, signedUpAt: "2026-05-11", status: "active" },
  { id: "u3", name: "Aïcha Benali", email: "aicha.b@example.fr", plan: "free", children: 1, customStories: 2, signedUpAt: "2026-05-19", status: "active" },
  { id: "u4", name: "Marie Dupont", email: "marie.dpt@example.fr", plan: "free", children: 0, customStories: 0, signedUpAt: "2026-06-01", status: "active" },
  { id: "u5", name: "Spam Bot", email: "xx7@tempmail.xx", plan: "free", children: 0, customStories: 0, signedUpAt: "2026-06-08", status: "disabled" },
];

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
  { id: "s1", title: "Le hérisson qui voulait voler", author: "Camille Lefèvre", ageRange: "3-5", theme: "courage", submittedAt: "2026-06-05", status: "pending" },
  { id: "s2", title: "Une sorcière à l'école", author: "Aïcha Benali", ageRange: "6-8", theme: "humour", submittedAt: "2026-06-07", status: "pending" },
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
  opens: number;
  readPct: number; // avg % read
  completionRate: number; // % readers reaching 90%
  audioPlays: number;
  favorites: number;
  avgRating: number;
  shares: number;
  reports: number;
};

/** Deterministic per-story analytics (mock). */
export const storyAnalytics: StoryAnalytics[] = mockStories.map((s, i) => ({
  slug: s.slug,
  title: s.title,
  opens: 1480 - i * 97,
  readPct: 84 - (i % 5) * 6,
  completionRate: 71 - (i % 7) * 4,
  audioPlays: s.hasAudio ? 620 - i * 41 : 0,
  favorites: 230 - i * 14,
  avgRating: s.rating,
  shares: 88 - i * 5,
  reports: i % 4 === 0 ? 1 : 0,
}));

export const globalKpis = {
  totalUsers: 412,
  activeUsers30d: 268,
  newUsers7d: 36,
  paidUsers: 0,
  childProfiles: 351,
  avgSessionMin: 11.4,
  accountConversionPct: 7.8,
  newsletterSignups: 189,
  storiesPublished: mockStories.length,
  customStoriesCreated: 57,
  topPersonalizationTheme: "aventure",
  topPersonalizationCharacter: "enfant-fille",
  pendingSubmissions: mockSubmissions.filter((s) => s.status === "pending").length,
  openReports: mockReports.filter((r) => r.status === "open").length,
};

export const DATE_RANGES = ["7", "15", "30", "60", "90", "180", "360", "all"] as const;
