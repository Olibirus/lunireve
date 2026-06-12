"use client";

import { useState } from "react";
import { StatusPill } from "@/components/admin/AdminShell";
import {
  mockReports,
  mockSubmissions,
  type Report,
  type Submission,
} from "@/data/mock-admin";
import { Check, X } from "lucide-react";

/**
 * Moderation, two queues: user-submitted stories (approve/reject) and
 * story/image reports (open → reviewing → resolved). State is local until
 * the DB lands; the actions mirror the future API exactly.
 */
export default function AdminModerationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [reports, setReports] = useState<Report[]>(mockReports);

  function decide(id: string, status: "approved" | "rejected") {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function setReportStatus(id: string, status: Report["status"]) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Modération</h1>

      {/* Submissions */}
      <section className="mt-8">
        <h2 className="font-serif text-xl tracking-tight">
          Histoires soumises par les utilisateurs
        </h2>
        <ul className="mt-4 space-y-3">
          {submissions.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-sm"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{s.title}</span>
                <span className="block text-xs text-[var(--color-ink-400)]">
                  {s.author} · {s.ageRange} ans · {s.theme} · {s.submittedAt}
                </span>
              </span>
              {s.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide(s.id, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-mint-400)] px-3 py-1.5 text-xs text-[var(--color-ink-800)] hover:bg-[var(--color-mint-500)]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(s.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-ink-100)] px-3 py-1.5 text-xs text-[var(--color-ink-600)] hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                    Refuser
                  </button>
                </div>
              ) : (
                <StatusPill tone={s.status === "approved" ? "green" : "red"}>
                  {s.status === "approved" ? "Approuvée" : "Refusée"}
                </StatusPill>
              )}
            </li>
          ))}
          {submissions.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[var(--color-ink-200)] p-6 text-center text-sm text-[var(--color-ink-500)]">
              Aucune soumission en attente.
            </li>
          )}
        </ul>
      </section>

      {/* Reports */}
      <section className="mt-10">
        <h2 className="font-serif text-xl tracking-tight">Signalements</h2>
        <ul className="mt-4 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-sm"
            >
              <StatusPill tone={r.type === "image" ? "amber" : "gray"}>
                {r.type === "image" ? "Image" : "Histoire"}
              </StatusPill>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{r.storyTitle}</span>
                <span className="block truncate text-xs text-[var(--color-ink-400)]">
                  {r.reason}
                  {r.comment && `, « ${r.comment} »`} · {r.reportedBy} · {r.reportedAt}
                </span>
              </span>
              <select
                value={r.status}
                onChange={(e) => setReportStatus(r.id, e.target.value as Report["status"])}
                aria-label={`Statut du signalement ${r.storyTitle}`}
                className="rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-2.5 py-1.5 text-xs"
              >
                <option value="open">Ouvert</option>
                <option value="reviewing">En cours</option>
                <option value="resolved">Résolu</option>
              </select>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
