import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { stories } from "./schema";

/**
 * User-submitted stories ("Soumettez votre histoire") — DB-backed so the
 * admin moderation queue shows REAL submissions instead of a local draft that
 * never left the author's browser.
 *
 * They live in the `stories` table like everything else (no migration needed),
 * marked by genre = "soumission":
 *   status draft     -> pending review (never public)
 *   status published -> approved by an admin, visible in the library
 *   status archived  -> rejected
 * Author identity + the consent snapshot live in generationMetadata, so we can
 * always prove which terms the author accepted, and when.
 */

const SUBMISSION_GENRE = "soumission";

export type SubmissionConsent = {
  /** Terms version the author ticked (bump when the wording changes). */
  version: string;
  acceptedAt: string;
  /** Locale the terms were displayed in. */
  locale: string;
};

type SubmissionMetadata = {
  author: string;
  authorEmail: string;
  authorUserId: string | null;
  theme?: string;
  excerpt?: string;
  consent: SubmissionConsent;
};

export type SubmissionRow = {
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
  consent: SubmissionConsent | null;
};

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** DB status -> the three states the moderation queue speaks in. */
function toStatus(status: string): SubmissionRow["status"] {
  if (status === "published") return "approved";
  if (status === "archived") return "rejected";
  return "pending";
}

function rowToSubmission(row: typeof stories.$inferSelect): SubmissionRow {
  const meta = (row.generationMetadata ?? {}) as Partial<SubmissionMetadata>;
  const body = row.chapters?.[0]?.content ?? "";
  return {
    id: row.id,
    title: row.title,
    author: meta.author ?? "",
    authorEmail: meta.authorEmail ?? "",
    ageRange: row.ageRange ?? "",
    genre: row.genre,
    theme: meta.theme ?? row.themes?.[0] ?? "",
    excerpt: meta.excerpt ?? body.slice(0, 180),
    body,
    submittedAt: (row.createdAt ?? new Date()).toISOString(),
    status: toStatus(row.status),
    consent: (meta.consent as SubmissionConsent | undefined) ?? null,
  };
}

/** Store a new submission as a pending (draft, never public) row. */
export async function insertSubmission(input: {
  title: string;
  body: string;
  ageRange: string;
  theme?: string;
  language: "fr" | "en";
  author: string;
  authorEmail: string;
  authorUserId: string | null;
  consent: SubmissionConsent;
}): Promise<string> {
  const base = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  const id = `US-${input.language.toUpperCase()}-${base}`;
  const wordCount = input.body.split(/\s+/).filter(Boolean).length;

  const metadata: SubmissionMetadata = {
    author: input.author,
    authorEmail: input.authorEmail,
    authorUserId: input.authorUserId,
    theme: input.theme,
    excerpt: input.body.slice(0, 180),
    consent: input.consent,
  };

  await db.insert(stories).values({
    id,
    baseId: base,
    language: input.language,
    type: "library",
    // Never public until an admin approves it.
    status: "draft",
    title: input.title,
    slug: `${slugify(input.title) || "histoire"}-${base.slice(0, 8)}`,
    ageRange: input.ageRange as typeof stories.$inferInsert.ageRange,
    genre: SUBMISSION_GENRE,
    themes: input.theme ? [input.theme] : [],
    wordCount,
    chapters: [{ title: input.title, content: input.body }],
    ownerUserId: input.authorUserId,
    generationMetadata: metadata,
  });

  return id;
}

/** Every submission, newest first (admin moderation queue). */
export async function selectSubmissions(limit = 300): Promise<SubmissionRow[]> {
  const rows = await db
    .select()
    .from(stories)
    .where(eq(stories.genre, SUBMISSION_GENRE))
    .orderBy(desc(stories.createdAt))
    .limit(limit);
  return rows.map(rowToSubmission);
}

/**
 * Approve or reject. Approving PUBLISHES the story into the library
 * (status published + publishedAt), which is the whole point of the queue.
 */
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionRow["status"]
): Promise<boolean> {
  const dbStatus =
    status === "approved" ? "published" : status === "rejected" ? "archived" : "draft";
  const res = await db
    .update(stories)
    .set({
      status: dbStatus,
      publishedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(stories.id, id), eq(stories.genre, SUBMISSION_GENRE)))
    .returning({ id: stories.id });
  return res.length > 0;
}

/** Admin edit before publishing (title, age, theme, text). */
export async function updateSubmissionContent(
  id: string,
  patch: { title?: string; ageRange?: string; theme?: string; body?: string }
): Promise<boolean> {
  const [row] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, id), eq(stories.genre, SUBMISSION_GENRE)))
    .limit(1);
  if (!row) return false;

  const meta = (row.generationMetadata ?? {}) as SubmissionMetadata;
  const body = patch.body ?? row.chapters?.[0]?.content ?? "";
  const title = patch.title ?? row.title;

  await db
    .update(stories)
    .set({
      title,
      ageRange: (patch.ageRange ?? row.ageRange) as typeof stories.$inferInsert.ageRange,
      themes: patch.theme ? [patch.theme] : row.themes,
      chapters: [{ title, content: body }],
      wordCount: body.split(/\s+/).filter(Boolean).length,
      generationMetadata: {
        ...meta,
        theme: patch.theme ?? meta.theme,
        excerpt: body.slice(0, 180),
      },
      updatedAt: new Date(),
    })
    .where(eq(stories.id, id));
  return true;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const res = await db
    .delete(stories)
    .where(and(eq(stories.id, id), eq(stories.genre, SUBMISSION_GENRE)))
    .returning({ id: stories.id });
  return res.length > 0;
}
