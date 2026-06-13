/**
 * Lunireve database schema — Drizzle ORM + Postgres (via Supabase).
 *
 * Design principles:
 * - Every entity has id (uuid) + createdAt + updatedAt.
 * - Stories are the core entity. FR and EN pairs are linked by `base_id`.
 * - Quotas are enforced per billing period (monthly reset).
 * - User-facing strings that need i18n (story title, slug, content) are duplicated
 *   per language row — NOT stored as jsonb — so SEO URLs are distinct indexable pages.
 * - Enums are Postgres-native for integrity. Add values via migration, never remove.
 * - Timestamps stored in UTC; the app renders in Europe/Paris.
 *
 * Convention: column names are snake_case in the DB, camelCase in TS.
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// Enums
// ============================================================================

export const languageEnum = pgEnum("language", ["fr", "en"]);

export const storyTypeEnum = pgEnum("story_type", [
  "library", // pre-generated, public, SEO content
  "text_story", // personalized text story (no child's likeness)
  "picture_story", // personalized picture story (with child's likeness)
]);

export const storyStatusEnum = pgEnum("story_status", [
  "draft", // generated but not reviewed
  "published", // visible on the site
  "archived", // soft-deleted or hidden
  "failed", // generation errored — kept for debugging
]);

export const ageRangeEnum = pgEnum("age_range", [
  "1-2",
  "3-4",
  "5-6",
  "7-8",
  "9-10", // Phase 2
  "11-12", // Phase 2
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "decouverte", // Free
  "essentiel", // 5.99/mo
  "premium", // 11.99/mo
  "famille_plus", // 149.99/yr
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "canceled",
  "past_due",
  "paused",
  "incomplete",
]);

export const printFormatEnum = pgEnum("print_format", [
  "softcover",
  "hardcover",
]);

export const printOrderStatusEnum = pgEnum("print_order_status", [
  "pending_payment",
  "paid",
  "submitted_to_printer",
  "in_production",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

export const characterTypeEnum = pgEnum("character_type", [
  "child",
  "sibling",
  "parent",
  "grandparent",
  "friend",
  "pet",
  "stuffed_toy",
  "other",
]);

// ============================================================================
// Users & profiles
// ============================================================================

/**
 * Users table is a 1:1 shadow of auth.users (Supabase Auth).
 * Supabase Auth owns identity; this table owns app-level profile data.
 * Linked via the `id` column matching auth.users.id.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches auth.users.id
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  preferredLanguage: languageEnum("preferred_language").notNull().default("fr"),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  // Accessibility preferences applied on every story read.
  dyslexiaFont: boolean("dyslexia_font").notNull().default(false),
  textSize: varchar("text_size", { length: 10 }).notNull().default("base"), // sm | base | lg | xl
  // Denormalized for quick rendering without a join.
  currentPlan: subscriptionPlanEnum("current_plan").notNull().default("decouverte"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Child profiles. Netflix model: each user can have multiple children,
 * each with their own reading history + recommendations.
 * Count limited by plan (1 for Découverte, up to 10 for Famille+).
 */
export const childProfiles = pgTable("child_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  // Denormalized age range for filter matching. Updated via cron as the child ages.
  ageRange: ageRangeEnum("age_range").notNull(),
  birthYear: integer("birth_year"), // optional — used to auto-advance ageRange
  gender: varchar("gender", { length: 20 }), // free-form; keep flexible
  pronouns: varchar("pronouns", { length: 20 }),
  // For text stories — description-based personalization.
  appearance: jsonb("appearance").$type<{
    skinTone?: string;
    hairColor?: string;
    hairStyle?: string;
  }>(),
  // Preferences learned over time and from explicit choices.
  favoriteGenres: text("favorite_genres").array().notNull().default(sql`'{}'::text[]`),
  favoriteThemes: text("favorite_themes").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Character reference sheets derived from uploaded photos.
 * GDPR: the original photos are DELETED after the sheet is generated.
 * Only this sheet (a stylized representation, not a photo) is retained.
 */
export const characterReferences = pgTable("character_references", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  childProfileId: uuid("child_profile_id").references(() => childProfiles.id, {
    onDelete: "set null",
  }),
  // URL to the stylized reference sheet in Supabase Storage.
  referenceUrl: text("reference_url").notNull(),
  // Provider metadata: which model produced the sheet, any conditioning tokens, etc.
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Recurring characters — reusable across stories for series continuity.
 * Quota: 1 (Découverte) → 50 (Famille+).
 */
export const recurringCharacters = pgTable("recurring_characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  childProfileId: uuid("child_profile_id").references(() => childProfiles.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 100 }).notNull(),
  type: characterTypeEnum("type").notNull(),
  description: text("description"), // free-form appearance / traits
  referenceId: uuid("reference_id").references(() => characterReferences.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ============================================================================
// Subscriptions & quotas
// ============================================================================

/**
 * Stripe subscription state — mirrors Stripe, kept in sync via webhooks.
 * We never rely on this for billing truth — always verify via Stripe API on mutation.
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique() // one subscription per user at a time
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 100,
  }),
  plan: subscriptionPlanEnum("plan").notNull().default("decouverte"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Per-period quota counters. Reset monthly by a cron job at period rollover.
 * Kept separate from `users` so we can snapshot historical usage.
 */
export const usageQuotas = pgTable(
  "usage_quotas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    textStoriesUsed: integer("text_stories_used").notNull().default(0),
    pictureStoriesUsed: integer("picture_stories_used").notNull().default(0),
    pdfDownloadsUsed: integer("pdf_downloads_used").notNull().default(0),
    audioDownloadsUsed: integer("audio_downloads_used").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    // One quota row per user per billing period.
    userPeriodIdx: uniqueIndex("usage_quotas_user_period_idx").on(
      t.userId,
      t.periodStart
    ),
  })
);

// ============================================================================
// Stories
// ============================================================================

/**
 * The core content entity. One row per language per story.
 *
 * Key relationships:
 * - `baseId` links FR and EN versions of the same story.
 * - `ownerUserId` is null for library stories, set for user-generated personalized stories.
 * - `primarySeoKeyword` is unique per language — enforced so the pipeline never generates
 *   two stories targeting the same long-tail query.
 *
 * Audio generation is lazy: `audioUrl` is null until the first user hits play.
 * This saves ~€0.02-0.08 per story that is never listened to.
 */
export const stories = pgTable(
  "stories",
  {
    id: varchar("id", { length: 50 }).primaryKey(), // e.g. ST-FR-56-ADV-00001
    baseId: varchar("base_id", { length: 30 }).notNull(), // e.g. 00056-ADV-00001 — links FR/EN pair
    language: languageEnum("language").notNull(),
    type: storyTypeEnum("type").notNull(),
    status: storyStatusEnum("status").notNull().default("draft"),

    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    primarySeoKeyword: varchar("primary_seo_keyword", { length: 200 }),

    ageRange: ageRangeEnum("age_range").notNull(),
    // Genre and themes reference enum values stored in code, not the DB,
    // because these evolve faster than migrations.
    genre: varchar("genre", { length: 50 }).notNull(),
    themes: text("themes").array().notNull().default(sql`'{}'::text[]`),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),

    wordCount: integer("word_count").notNull().default(0),
    estimatedReadingMinutes: integer("estimated_reading_minutes"),

    // Narrative content. Chapters is an ordered array.
    chapters: jsonb("chapters")
      .$type<Array<{ title: string; content: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // Lexical words = difficult words with definitions, shown inline on tap.
    lexicalWords: jsonb("lexical_words")
      .$type<Array<{ word: string; definition: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    quiz: jsonb("quiz").$type<{
      questions: Array<{
        question: string;
        choices: string[];
        correctIndex: number;
      }>;
      activity: { title: string; description: string };
      moral: string;
    }>(),

    // Media — lazy-generated on first access.
    heroImageUrl: text("hero_image_url"),
    midImageUrl: text("mid_image_url"),
    // For picture stories, the per-page illustrations live here.
    pageImages: jsonb("page_images")
      .$type<Array<{ pageNumber: number; url: string; alt: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    audioUrl: text("audio_url"), // null until first user hits play
    pdfUrl: text("pdf_url"), // on-demand generated
    pdfPrintReadyUrl: text("pdf_print_ready_url"), // CMYK + bleed — only for print orders

    // Ownership — null = library story, set = user-generated
    ownerUserId: uuid("owner_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    childProfileId: uuid("child_profile_id").references(() => childProfiles.id, {
      onDelete: "set null",
    }),

    // Series support (Phase 3)
    seriesId: uuid("series_id"),
    episodeNumber: integer("episode_number"),

    // Ratings + favorites — denormalized for fast sorting.
    ratingAverage: real("rating_average").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    favoritesCount: integer("favorites_count").notNull().default(0),

    // Provider metadata: which models were used, token counts, cost estimate.
    generationMetadata: jsonb("generation_metadata").$type<
      Record<string, unknown>
    >(),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    // SEO dedup: each primary keyword can only target ONE story per language.
    uniqueKeywordPerLang: uniqueIndex("stories_keyword_lang_idx").on(
      t.language,
      t.primarySeoKeyword
    ),
    uniqueSlugPerLang: uniqueIndex("stories_slug_lang_idx").on(
      t.language,
      t.slug
    ),
  })
);

// ============================================================================
// Engagement: favorites, ratings, reading history, reports
// ============================================================================

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: varchar("story_id", { length: 50 })
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    uniq: uniqueIndex("favorites_user_story_idx").on(t.userId, t.storyId),
  })
);

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: varchar("story_id", { length: 50 })
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    stars: integer("stars").notNull(), // 1-5, CHECK constraint added in migration SQL
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    uniq: uniqueIndex("ratings_user_story_idx").on(t.userId, t.storyId),
  })
);

export const readingHistory = pgTable("reading_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  childProfileId: uuid("child_profile_id").references(() => childProfiles.id, {
    onDelete: "set null",
  }),
  storyId: varchar("story_id", { length: 50 })
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  // 0-100 percentage complete. Used for "resume reading" on dashboard.
  progressPercent: integer("progress_percent").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  lastReadAt: timestamp("last_read_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterUserId: uuid("reporter_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  storyId: varchar("story_id", { length: 50 })
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 50 }).notNull(), // inappropriate_content | factual_error | other
  details: text("details"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ============================================================================
// Print-on-demand orders
// ============================================================================

export const printOrders = pgTable("print_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  storyId: varchar("story_id", { length: 50 })
    .notNull()
    .references(() => stories.id, { onDelete: "restrict" }),
  format: printFormatEnum("format").notNull(),
  // Snapshot of pricing at purchase time — never recompute from current prices.
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  dedicationText: text("dedication_text"),
  giftWrap: boolean("gift_wrap").notNull().default(false),
  expressShipping: boolean("express_shipping").notNull().default(false),
  // Shipping snapshot — address may change in user profile later.
  shippingAddress: jsonb("shipping_address").$type<{
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string; // ISO-3166 alpha-2
  }>().notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
  gelatoOrderId: varchar("gelato_order_id", { length: 100 }),
  trackingUrl: text("tracking_url"),
  status: printOrderStatusEnum("status").notNull().default("pending_payment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ============================================================================
// Content ops: blog, newsletter preferences
// ============================================================================

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    baseId: varchar("base_id", { length: 30 }).notNull(), // links FR/EN pair
    language: languageEnum("language").notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(), // MDX or HTML
    coverImageUrl: text("cover_image_url"),
    metaDescription: varchar("meta_description", { length: 300 }),
    seoKeywords: text("seo_keywords").array().notNull().default(sql`'{}'::text[]`),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    uniqueSlugPerLang: uniqueIndex("blog_posts_slug_lang_idx").on(
      t.language,
      t.slug
    ),
  })
);

export const newsletterPreferences = pgTable("newsletter_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  subscribed: boolean("subscribed").notNull().default(true),
  // Filter: receive stories matching these age ranges / genres.
  ageRanges: text("age_ranges").array().notNull().default(sql`'{}'::text[]`),
  genres: text("genres").array().notNull().default(sql`'{}'::text[]`),
  frequency: varchar("frequency", { length: 20 }).notNull().default("weekly"), // weekly | biweekly | monthly | off
  brevoContactId: varchar("brevo_contact_id", { length: 100 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ============================================================================
// Type exports
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type PrintOrder = typeof printOrders.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
