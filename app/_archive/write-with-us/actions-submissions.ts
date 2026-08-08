"use server";

import { getSession } from "@/lib/auth/session";
import {
  insertSubmission,
  selectSubmissions,
  updateSubmissionStatus,
  updateSubmissionContent,
  deleteSubmission,
  type SubmissionRow,
} from "@/db/submissions";

/**
 * Server actions for user story submissions: author submits -> row lands in
 * the admin moderation queue -> approving publishes it to the library.
 *
 * The consent snapshot (which terms version was ticked, when) is recorded
 * server-side, never taken from the client's word alone.
 */

/** Bump when the submission terms wording changes. */
const SUBMISSION_TERMS_VERSION = "2026-07-v1";

export async function submitStory(input: {
  title: string;
  body: string;
  ageRange: string;
  theme?: string;
  language: "fr" | "en";
  authorName: string;
  acceptedTerms: boolean;
}): Promise<{ ok: true; id: string } | { ok: false; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "auth" };
  // The rights assignment is the whole point of the checkbox: no tick, no row.
  if (!input.acceptedTerms) return { ok: false, error: "terms" };
  if (input.title.trim().length < 2 || input.body.trim().length < 200) {
    return { ok: false, error: "invalid" };
  }

  try {
    const id = await insertSubmission({
      title: input.title.trim(),
      body: input.body.trim(),
      ageRange: input.ageRange,
      theme: input.theme,
      language: input.language,
      author: input.authorName.trim() || session.username,
      authorEmail: session.username,
      authorUserId: session.userId ?? null,
      consent: {
        version: SUBMISSION_TERMS_VERSION,
        acceptedAt: new Date().toISOString(),
        locale: input.language,
      },
    });
    return { ok: true, id };
  } catch (e) {
    console.error("[Lunireve] submitStory failed:", e);
    return { ok: false, error: "server" };
  }
}

/** Admin: the real moderation queue. */
export async function listSubmissions(): Promise<SubmissionRow[]> {
  const session = await getSession();
  if (session?.role !== "admin") return [];
  try {
    return await selectSubmissions();
  } catch (e) {
    console.error("[Lunireve] listSubmissions failed:", e);
    return [];
  }
}

/** Admin: approve (publishes to the library) or reject. */
export async function decideSubmission(
  id: string,
  status: SubmissionRow["status"]
): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (session?.role !== "admin") return { ok: false };
  try {
    return { ok: await updateSubmissionStatus(id, status) };
  } catch (e) {
    console.error("[Lunireve] decideSubmission failed:", e);
    return { ok: false };
  }
}

/** Admin: edit a submission before publishing it. */
export async function editSubmission(
  id: string,
  patch: { title?: string; ageRange?: string; theme?: string; body?: string }
): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (session?.role !== "admin") return { ok: false };
  try {
    return { ok: await updateSubmissionContent(id, patch) };
  } catch (e) {
    console.error("[Lunireve] editSubmission failed:", e);
    return { ok: false };
  }
}

export async function removeSubmission(id: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (session?.role !== "admin") return { ok: false };
  try {
    return { ok: await deleteSubmission(id) };
  } catch (e) {
    console.error("[Lunireve] removeSubmission failed:", e);
    return { ok: false };
  }
}
