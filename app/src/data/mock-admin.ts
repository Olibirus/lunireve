import { mockStories, ageLabel, durationBucket, type AgeRange, type Genre, type DurationBucket } from "./mock-stories";

/**
 * Admin mock data.
 *
 * NOTE ON DATA: the back-office normally shows REAL data only (decision #22 —
 * zeros until events land). For the analytics build-out (revenue, per-user
 * spend, downloads, listen time) the owner asked for DEMO data so the full
 * dashboards are visible now. Everything below is illustrative and surfaced in
 * the UI behind a "DÉMO" badge. Phase 2 swaps every export for Drizzle
 * aggregates over Supabase (users, events, Stripe) — the shapes already match.
 */
export const DEMO = true;

/** Deterministic pseudo-random in [0,1) — keeps demo numbers stable across
 * server/client renders (no Math.random at runtime → no hydration drift). */
function rng(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Format a number as euros, French locale, no decimals by default. */
export function formatEur(n: number, decimals = 0): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export type UserTier = "free" | "plus" | "max";

export const TIER_LABEL: Record<UserTier, string> = {
  free: "Gratuit",
  plus: "Plus",
  max: "Max",
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  country: string;
  countryCode: string;
  tier: UserTier;
  children: number;
  customStories: number;
  storiesRead: number;
  /** Cumulative audio listening time, minutes. */
  listenMinutes: number;
  /** Lifetime subscription revenue from this user, euros. */
  subscriptionSpend: number;
  /** Lifetime print/book revenue from this user, euros. */
  printSpend: number;
  signedUpAt: string;
  lastActiveAt: string;
  status: "active" | "disabled";
  /** Goodwill gestures granted by an admin (free months, refunds, free print). */
  compensations?: Compensation[];
};

export type Compensation = {
  label: string;
  grantedAt: string; // YYYY-MM-DD
};

/** Total lifetime value = subscription + print. */
export function userTotalSpend(u: AdminUser): number {
  return u.subscriptionSpend + u.printSpend;
}

/**
 * DEMO users — a representative recent slice (the KPIs reflect the full base).
 * Real signups replace this list at the Supabase Auth swap.
 */
const RAW_USERS: [
  string, string, string, string, UserTier, number, number, number, number, number, number, string, string, AdminUser["status"]
][] = [
  // name, email, country, code, tier, children, custom, read, listenMin, subSpend, printSpend, signedUp, lastActive, status
  ["Camille Lefèvre", "camille.l@example.fr", "France", "FR", "max", 3, 24, 186, 940, 119.88, 64, "2025-09-12", "2026-06-13", "active"],
  ["Thomas Garnier", "t.garnier@example.fr", "France", "FR", "plus", 2, 11, 92, 410, 59.88, 0, "2025-10-03", "2026-06-12", "active"],
  ["Aïcha Benali", "aicha.b@example.fr", "France", "FR", "plus", 1, 8, 64, 320, 49.9, 32, "2025-11-20", "2026-06-11", "active"],
  ["Sophie Marchand", "s.marchand@example.be", "Belgique", "BE", "max", 2, 19, 140, 880, 99.9, 96, "2025-08-29", "2026-06-13", "active"],
  ["Lucas Dubois", "lucas.d@example.fr", "France", "FR", "free", 1, 2, 28, 60, 0, 0, "2026-05-30", "2026-06-10", "active"],
  ["Emma Rossi", "emma.rossi@example.ch", "Suisse", "CH", "plus", 2, 14, 108, 520, 39.92, 48, "2026-01-15", "2026-06-09", "active"],
  ["Noah Lambert", "noah.l@example.be", "Belgique", "BE", "free", 1, 1, 12, 0, 0, 0, "2026-06-02", "2026-06-08", "active"],
  ["Chloé Fontaine", "chloe.f@example.fr", "France", "FR", "plus", 3, 16, 132, 690, 54.89, 32, "2025-12-08", "2026-06-13", "active"],
  ["Gabriel Mercier", "g.mercier@example.ca", "Canada", "CA", "free", 2, 4, 40, 130, 0, 0, "2026-04-21", "2026-06-05", "active"],
  ["Léa Moreau", "lea.moreau@example.fr", "France", "FR", "max", 1, 22, 168, 1020, 109.89, 128, "2025-09-30", "2026-06-12", "active"],
  ["Hugo Petit", "hugo.petit@example.fr", "France", "FR", "free", 1, 0, 6, 0, 0, 0, "2026-06-09", "2026-06-09", "active"],
  ["Manon Girard", "manon.g@example.ch", "Suisse", "CH", "plus", 2, 9, 76, 360, 44.91, 0, "2026-02-11", "2026-06-07", "active"],
  ["Adam Faure", "adam.faure@example.lu", "Luxembourg", "LU", "free", 1, 3, 22, 45, 0, 0, "2026-05-18", "2026-06-04", "disabled"],
  ["Inès Roux", "ines.roux@example.fr", "France", "FR", "max", 2, 27, 204, 1180, 129.87, 160, "2025-08-14", "2026-06-13", "active"],
  ["Raphaël Blanc", "r.blanc@example.be", "Belgique", "BE", "plus", 1, 7, 58, 290, 34.93, 32, "2026-03-02", "2026-06-06", "active"],
  ["Jade Henry", "jade.henry@example.fr", "France", "FR", "free", 2, 5, 44, 90, 0, 0, "2026-04-28", "2026-06-01", "active"],
  ["Nathan Girard", "n.girard@example.ca", "Canada", "CA", "plus", 1, 6, 52, 240, 24.95, 0, "2026-03-19", "2026-06-10", "active"],
  ["Louna Mathieu", "louna.m@example.fr", "France", "FR", "free", 1, 1, 9, 0, 0, 0, "2026-06-11", "2026-06-12", "active"],
];

export const mockUsers: AdminUser[] = RAW_USERS.map((r, i) => ({
  id: `u${i + 1}`,
  name: r[0],
  email: r[1],
  country: r[2],
  countryCode: r[3],
  tier: r[4],
  children: r[5],
  customStories: r[6],
  storiesRead: r[7],
  listenMinutes: r[8],
  subscriptionSpend: r[9],
  printSpend: r[10],
  signedUpAt: r[11],
  lastActiveAt: r[12],
  status: r[13],
}));

export type Submission = {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  ageRange: string;
  genre: string;
  theme: string;
  excerpt: string;
  body: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
};

export const mockSubmissions: Submission[] = [
  {
    id: "s1",
    title: "Le hérisson qui voulait voler",
    author: "Camille Lefèvre",
    authorEmail: "camille.l@example.fr",
    ageRange: "3-4",
    genre: "conte",
    theme: "courage",
    excerpt:
      "Pic le hérisson rêve de voler comme les hirondelles. Une nuit d'été, le vent lui propose un marché.",
    body:
      "Pic était un hérisson comme les autres, sauf sur un point : il passait ses journées le nez en l'air, à regarder les oiseaux.\n\n« Un jour, je volerai », répétait-il à qui voulait l'entendre. Les autres animaux riaient gentiment.\n\nUne nuit, le vent du soir s'arrêta près de lui. « Je peux te porter, petit Pic, mais tu devras lâcher prise. » Et Pic, pour la première fois, ferma les yeux et se laissa emporter.",
    submittedAt: "2026-06-05",
    status: "pending",
  },
  {
    id: "s2",
    title: "Une sorcière à l'école",
    author: "Aïcha Benali",
    authorEmail: "aicha.b@example.fr",
    ageRange: "7-8",
    genre: "fantastique",
    theme: "humour",
    excerpt:
      "Le jour de la rentrée, la nouvelle maîtresse arrive sur un balai. Personne n'ose rien dire.",
    body:
      "La maîtresse s'appelait Mademoiselle Ortie. Elle portait un chapeau pointu qu'elle disait « très pratique pour ranger les craies ».\n\nLe premier jour, les additions se mirent à danser au tableau. Le deuxième, le cartable de Léo se transforma en grenouille.\n\nMais bizarrement, dans la classe de Mademoiselle Ortie, plus personne n'avait peur d'apprendre.",
    submittedAt: "2026-06-07",
    status: "pending",
  },
  {
    id: "s3",
    title: "Le robot qui collectionnait les étoiles",
    author: "Nathan Girard",
    authorEmail: "n.girard@example.ca",
    ageRange: "9-10",
    genre: "science-fiction",
    theme: "amitie",
    excerpt:
      "Sur une planète sans nuit, un petit robot range les étoiles dans des bocaux. Jusqu'au jour où il en manque une.",
    body:
      "BIP-7 avait une mission : compter les étoiles chaque soir et les ranger soigneusement.\n\nUn matin, il en manquait une. BIP-7 partit la chercher au bout du ciel.\n\nCe qu'il trouva n'était pas une étoile, mais une petite fille perdue qui cherchait, elle aussi, le chemin de la maison.",
    submittedAt: "2026-06-11",
    status: "pending",
  },
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
  { id: "r3", storySlug: "la-course-des-etoiles-filantes", storyTitle: "La course des étoiles filantes", type: "story", reason: "Autre", comment: "", reportedBy: "anonyme", reportedAt: "2026-06-10", status: "open" },
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
  publishedAt: string; // YYYY-MM-DD
  // Story attributes (real metadata — drives the per-story filter columns).
  ageRange: AgeRange;
  genre: Genre;
  duration: DurationBucket;
  hasAudio: boolean;
  interactive: boolean;
  // Metrics (DEMO).
  opens: number;
  readPct: number; // avg % read
  completionRate: number; // % readers reaching 90%
  audioPlays: number;
  avgListenSec: number; // average listening time per play
  pdfDownloads: number;
  epubDownloads: number;
  favorites: number;
  avgRating: number;
  shares: number;
  reports: number;
  // Readership gender split.
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

/** Seconds → "4 min 30" / "45 s". */
export function formatListen(sec: number): string {
  if (sec <= 0) return "·";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${String(s).padStart(2, "0")}` : `${m} min`;
}

/**
 * Per-story analytics (DEMO). Story attributes are real metadata; metrics are
 * deterministic illustrative numbers. Phase 2 = SQL aggregates over events.
 */
export const storyAnalytics: StoryAnalytics[] = mockStories.map((s, i) => {
  const pop = 0.3 + rng(i + 1) * 0.7; // popularity 0.3..1
  const opens = Math.round(40 + pop * 360); // small-beta scale
  const audioPlays = s.hasAudio ? Math.round(opens * (0.3 + rng(i + 2) * 0.3)) : 0;
  const avgListenSec = s.hasAudio ? Math.round(s.readingMinutes * 60 * (0.55 + rng(i + 11) * 0.4)) : 0;
  const pdfDownloads = Math.round(opens * (0.06 + rng(i + 5) * 0.1));
  const epubDownloads = Math.round(pdfDownloads * (0.25 + rng(i + 6) * 0.45));
  const readPct = Math.round(58 + rng(i + 9) * 37); // 58..95
  const completionRate = Math.round(readPct * (0.62 + rng(i + 10) * 0.3));
  const girls = Math.round(42 + rng(i + 12) * 18);
  return {
    slug: s.slug,
    title: s.title,
    publishedAt: s.publishedAt,
    ageRange: s.ageRange,
    genre: s.genre,
    duration: durationBucket(s.readingMinutes),
    hasAudio: s.hasAudio,
    interactive: s.interactive,
    opens,
    readPct,
    completionRate,
    audioPlays,
    avgListenSec,
    pdfDownloads,
    epubDownloads,
    favorites: Math.round(opens * (0.05 + rng(i + 3) * 0.08)),
    avgRating: Math.round((3.9 + rng(i + 13) * 1.05) * 10) / 10,
    shares: Math.round(opens * (0.01 + rng(i + 4) * 0.03)),
    reports: rng(i + 7) > 0.86 ? 1 : 0,
    readersGirlPct: girls,
    readersBoyPct: 100 - girls,
  };
});

// ============================================================================
// Revenue (DEMO) — Stripe payments are V2; these illustrate the dashboards.
// ============================================================================

export type RevenuePoint = {
  month: string; // "2025-07"
  label: string; // "juil."
  recurring: number; // subscription MRR realised that month
  oneOff: number; // book printing revenue that month
  projected?: boolean; // future / forecast point
};

const MONTH_LABELS = ["juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avr.", "mai", "juin"];
// 12 months ending June 2026, recurring ramping up + sporadic print revenue.
const RECURRING_RAMP = [180, 264, 352, 451, 560, 642, 763, 868, 967, 1064, 1158, 1238];
const ONEOFF_RAMP = [0, 0, 96, 64, 192, 320, 128, 224, 256, 192, 352, 288];

export const revenueSeries: RevenuePoint[] = RECURRING_RAMP.map((recurring, i) => {
  const monthIndex = (6 + i) % 12; // start July (index 6)
  const year = i < 6 ? 2025 : 2026;
  return {
    month: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    label: MONTH_LABELS[i],
    recurring,
    oneOff: ONEOFF_RAMP[i],
  };
});

// Two forecast months extending the curve (~12% MoM growth).
export const revenueForecast: RevenuePoint[] = [
  { month: "2026-07", label: "juil.", recurring: 1387, oneOff: 310, projected: true },
  { month: "2026-08", label: "août", recurring: 1553, oneOff: 330, projected: true },
];

export type TierRevenue = {
  tier: UserTier;
  label: string;
  price: number; // monthly price
  subscribers: number;
  mrr: number;
};

const TIER_PRICES: Record<UserTier, number> = { free: 0, plus: 4.99, max: 9.99 };
const TIER_SUBS: Record<UserTier, number> = { free: 2640, plus: 142, max: 53 };

export const revenueByTier: TierRevenue[] = (["free", "plus", "max"] as UserTier[]).map((tier) => ({
  tier,
  label: TIER_LABEL[tier],
  price: TIER_PRICES[tier],
  subscribers: TIER_SUBS[tier],
  mrr: Math.round(TIER_PRICES[tier] * TIER_SUBS[tier] * 100) / 100,
}));

export type CountryRevenue = {
  country: string;
  code: string;
  users: number;
  revenue: number; // monthly recurring share, euros
};

export const revenueByCountry: CountryRevenue[] = [
  { country: "France", code: "FR", users: 1980, revenue: 842 },
  { country: "Belgique", code: "BE", users: 312, revenue: 198 },
  { country: "Suisse", code: "CH", users: 224, revenue: 142 },
  { country: "Canada", code: "CA", users: 196, revenue: 44 },
  { country: "Luxembourg", code: "LU", users: 88, revenue: 12 },
  { country: "Autres", code: "··", users: 35, revenue: 0 },
];

const mrr = revenueByTier.reduce((sum, t) => sum + t.mrr, 0);
const recurringToDate = revenueSeries.reduce((sum, p) => sum + p.recurring, 0);
const oneOffToDate = revenueSeries.reduce((sum, p) => sum + p.oneOff, 0);
const activeSubscribers = revenueByTier.filter((t) => t.tier !== "free").reduce((s, t) => s + t.subscribers, 0);

export const revenueKpis = {
  mrr, // present recurring
  arr: Math.round(mrr * 12),
  projectedNext30: Math.round(mrr * 1.12), // future
  recurringToDate, // past recurring
  oneOffToDate, // past one-off (book printing)
  totalToDate: recurringToDate + oneOffToDate,
  activeSubscribers,
  arpu: Math.round((mrr / activeSubscribers) * 100) / 100, // per paying subscriber
  recurringSharePct: Math.round((recurringToDate / (recurringToDate + oneOffToDate)) * 100),
};

/**
 * Revenue for the ongoing calendar month (1st → today) plus the full-month
 * forecast (1st → end). Reads the current month's point from the series/
 * forecast as the full-month estimate, then prorates by days elapsed.
 */
export function currentMonthRevenue() {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const point = [...revenueSeries, ...revenueForecast].find((p) => p.month === ym);
  // Full-month estimate: the month's point if known, else MRR + a typical print month.
  const forecast = point ? point.recurring + point.oneOff : Math.round(mrr * 1.12);
  const mtd = Math.round((forecast * dayOfMonth) / daysInMonth);
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return { monthLabel, mtd, forecast, dayOfMonth, daysInMonth };
}

/** Global KPIs (DEMO). Phase 2 = live counts. */
const totalUsers = revenueByTier.reduce((s, t) => s + t.subscribers, 0);
export const globalKpis = {
  totalUsers,
  activeUsers30d: 1186,
  newUsers7d: 94,
  paidUsers: activeSubscribers,
  childProfiles: 3120,
  avgSessionMin: 11,
  accountConversionPct: 6.4,
  newsletterSignups: 1840,
  storiesPublished: mockStories.length,
  customStoriesCreated: storyAnalytics.length * 18 + 42,
  topPersonalizationTheme: "Aventure",
  topPersonalizationCharacter: "Prénom de l'enfant",
  pendingSubmissions: mockSubmissions.filter((s) => s.status === "pending").length,
  openReports: mockReports.filter((r) => r.status === "open").length,
};

/** Pending moderation tasks (submissions awaiting review + unresolved reports)
 * — drives the red count badge next to "Modération" in the admin sidebar. */
export const moderationPendingCount =
  mockSubmissions.filter((s) => s.status === "pending").length +
  mockReports.filter((r) => r.status !== "resolved").length;

export const DATE_RANGES = ["7", "15", "30", "60", "90", "180", "360", "all"] as const;
