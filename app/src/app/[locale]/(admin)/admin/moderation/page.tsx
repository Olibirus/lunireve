"use client";

import { useState } from "react";
import { StatusPill } from "@/components/admin/AdminShell";
import {
  mockReports,
  mockSubmissions,
  type Report,
  type Submission,
} from "@/data/mock-admin";
import { findStory } from "@/data/mock-stories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { Check, ExternalLink, Pencil, Trash2, X } from "lucide-react";

/**
 * Moderation, two queues: user-submitted stories and story/image reports.
 * Each row opens a detail modal where the story can be read, then approved,
 * edited or deleted. State is local until the DB lands; the actions mirror the
 * future API exactly.
 */
export default function AdminModerationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [openSub, setOpenSub] = useState<Submission | null>(null);
  const [openReport, setOpenReport] = useState<Report | null>(null);

  function decideSub(id: string, status: Submission["status"]) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }
  function saveSub(next: Submission) {
    setSubmissions((prev) => prev.map((s) => (s.id === next.id ? next : s)));
    setOpenSub(next);
  }
  function deleteSub(id: string) {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setOpenSub(null);
  }

  function saveReport(next: Report) {
    setReports((prev) => prev.map((r) => (r.id === next.id ? next : r)));
    setOpenReport(next);
  }
  function setReportStatus(id: string, status: Report["status"]) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }
  function deleteReport(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setOpenReport(null);
  }

  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Modération</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        Cliquez une ligne pour lire l&apos;histoire, puis approuver, modifier ou supprimer.
      </p>

      {/* Submissions */}
      <section className="mt-8">
        <h2 className="font-serif text-xl tracking-tight">
          Histoires soumises par les utilisateurs
        </h2>
        <ul className="mt-4 space-y-3">
          {submissions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setOpenSub(s)}
                className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--color-cream-100)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{s.title}</span>
                  <span className="block text-xs text-[var(--color-ink-400)]">
                    {s.author} · {s.ageRange} ans · {s.genre} · {s.submittedAt}
                  </span>
                </span>
                {s.status === "pending" ? (
                  <StatusPill tone="amber">En attente</StatusPill>
                ) : (
                  <StatusPill tone={s.status === "approved" ? "green" : "red"}>
                    {s.status === "approved" ? "Approuvée" : "Refusée"}
                  </StatusPill>
                )}
                <span className="text-xs text-[var(--color-indigo-soft-600)]">Ouvrir →</span>
              </button>
            </li>
          ))}
          {submissions.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[var(--color-ink-200)] p-6 text-center text-sm text-[var(--color-ink-500)]">
              Aucune soumission.
            </li>
          )}
        </ul>
      </section>

      {/* Reports */}
      <section className="mt-10">
        <h2 className="font-serif text-xl tracking-tight">Signalements</h2>
        <ul className="mt-4 space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpenReport(r)}
                className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--color-cream-100)]"
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
                <StatusPill
                  tone={r.status === "open" ? "red" : r.status === "reviewing" ? "amber" : "green"}
                >
                  {r.status === "open" ? "Ouvert" : r.status === "reviewing" ? "En cours" : "Résolu"}
                </StatusPill>
                <span className="text-xs text-[var(--color-indigo-soft-600)]">Ouvrir →</span>
              </button>
            </li>
          ))}
          {reports.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[var(--color-ink-200)] p-6 text-center text-sm text-[var(--color-ink-500)]">
              Aucun signalement.
            </li>
          )}
        </ul>
      </section>

      {openSub && (
        <SubmissionDialog
          submission={openSub}
          onClose={() => setOpenSub(null)}
          onSave={saveSub}
          onDecision={(status) => decideSub(openSub.id, status)}
          onDelete={() => deleteSub(openSub.id)}
        />
      )}
      {openReport && (
        <ReportDialog
          report={openReport}
          onClose={() => setOpenReport(null)}
          onSave={saveReport}
          onSetStatus={(status) => setReportStatus(openReport.id, status)}
          onDelete={() => deleteReport(openReport.id)}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */

function SubmissionDialog({
  submission,
  onClose,
  onSave,
  onDecision,
  onDelete,
}: {
  submission: Submission;
  onClose: () => void;
  onSave: (s: Submission) => void;
  onDecision: (status: Submission["status"]) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Submission>(submission);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier la soumission" : submission.title}</DialogTitle>
          <DialogDescription>
            {submission.author} · {submission.authorEmail} · soumis le {submission.submittedAt}
          </DialogDescription>
        </DialogHeader>

        {editing ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            <div>
              <Label htmlFor="m-title">Titre</Label>
              <Input id="m-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="m-age">Âge</Label>
                <Input id="m-age" value={draft.ageRange} onChange={(e) => setDraft({ ...draft, ageRange: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="m-genre">Genre</Label>
                <Input id="m-genre" value={draft.genre} onChange={(e) => setDraft({ ...draft, genre: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="m-theme">Thème</Label>
                <Input id="m-theme" value={draft.theme} onChange={(e) => setDraft({ ...draft, theme: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="m-excerpt">Résumé</Label>
              <Textarea id="m-excerpt" rows={2} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="m-body">Texte</Label>
              <Textarea id="m-body" rows={10} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="mt-1.5 font-mono text-xs" />
            </div>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="gray">{submission.ageRange} ans</StatusPill>
              <StatusPill tone="gray">{submission.genre}</StatusPill>
              <StatusPill tone="gray">{submission.theme}</StatusPill>
            </div>
            <p className="mt-3 text-sm italic text-[var(--color-ink-600)]">{submission.excerpt}</p>
            <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-[var(--color-ink-700)]">
              {submission.body.split(/\n\s*\n/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-ink-100)] pt-4">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setDraft(submission); setEditing(false); }}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" onClick={() => { onSave(draft); setEditing(false); }}>
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-[var(--color-ink-500)] hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDecision("rejected")}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                Refuser
              </Button>
              <Button variant="mint" size="sm" onClick={() => onDecision("approved")}>
                <Check className="h-4 w-4" />
                Approuver
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

function ReportDialog({
  report,
  onClose,
  onSave,
  onSetStatus,
  onDelete,
}: {
  report: Report;
  onClose: () => void;
  onSave: (r: Report) => void;
  onSetStatus: (status: Report["status"]) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Report>(report);
  const story = findStory(report.storySlug);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{report.storyTitle}</DialogTitle>
          <DialogDescription>
            Signalement {report.type === "image" ? "d'image" : "d'histoire"} · {report.reportedBy} · {report.reportedAt}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {/* Report detail */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="r-reason">Motif</Label>
                <Input id="r-reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="r-comment">Commentaire</Label>
                <Textarea id="r-comment" rows={3} value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="r-status">Statut</Label>
                <select
                  id="r-status"
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as Report["status"] })}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2 text-sm"
                >
                  <option value="open">Ouvert</option>
                  <option value="reviewing">En cours</option>
                  <option value="resolved">Résolu</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)]/60 p-4 text-sm">
              <p><span className="text-[var(--color-ink-400)]">Motif :</span> {report.reason}</p>
              {report.comment && (
                <p className="mt-1.5 italic text-[var(--color-ink-600)]">« {report.comment} »</p>
              )}
            </div>
          )}

          {/* Reported story preview */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-ink-400)]">Histoire concernée</p>
            {story ? (
              <div className="mt-2 rounded-2xl border border-[var(--color-ink-100)] p-4">
                <p className="font-medium">{story.title}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-400)]">
                  {story.ageRange} ans · {story.genre} · {story.readingMinutes} min
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-600)]">{story.excerpt}</p>
                <Link
                  href={{ pathname: "/histoires/[slug]", params: { slug: story.slug } }}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-indigo-soft-600)] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvrir l&apos;histoire
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-ink-400)]">
                Histoire introuvable (peut-être déjà retirée).
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-ink-100)] pt-4">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setDraft(report); setEditing(false); }}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" onClick={() => { onSave(draft); setEditing(false); }}>
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-[var(--color-ink-500)] hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              {report.status !== "resolved" && (
                <Button variant="mint" size="sm" onClick={() => onSetStatus("resolved")}>
                  <Check className="h-4 w-4" />
                  Marquer résolu
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
