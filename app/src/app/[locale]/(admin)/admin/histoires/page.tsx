"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/admin/AdminShell";
import {
  readStories,
  saveStory,
  deleteStory,
  slugify,
  type AdminStory,
} from "@/lib/adminStories";
import { GENRES, AGE_RANGES, findStory, storyBody, ageLabel } from "@/data/mock-stories";
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
import { cn } from "@/lib/utils/cn";
import { ExternalLink, Eye, Pencil, Plus, Star, Trash2 } from "lucide-react";

/**
 * Stories CRUD over the library. Edits/deletes persist via the adminStories
 * store (localStorage now, Supabase `stories` in Phase 2). Bank stories
 * auto-publish (brief decision #37); admin can unpublish/edit/remove here.
 */
const EMPTY: AdminStory = {
  slug: "",
  title: "",
  genre: "conte",
  ageRange: "5-6",
  readingMinutes: 6,
  rating: 0,
  status: "published",
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [editing, setEditing] = useState<{ story: AdminStory; isNew: boolean } | null>(null);
  const [viewing, setViewing] = useState<AdminStory | null>(null);

  useEffect(() => {
    setStories(readStories());
  }, []);

  function refresh() {
    setStories(readStories());
  }

  function remove(story: AdminStory) {
    if (!window.confirm(`Supprimer l'histoire « ${story.title} » ?`)) return;
    deleteStory(story.slug);
    refresh();
  }

  function onSaved(next: AdminStory, originalSlug?: string) {
    saveStory(next, originalSlug);
    setEditing(null);
    refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Histoires</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">
            {stories.length} histoires · publication automatique, retrait manuel
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Real creation flow (theme, hero...): an admin run lands in the
              LIBRARY, not in the personalized stories (feedback). */}
          <Link
            href={{ pathname: "/creer", query: { bibliotheque: "1" } }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ink-800)] px-4 py-2.5 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
          >
            <Plus className="h-4 w-4" />
            Nouvelle histoire
          </Link>
          <button
            type="button"
            onClick={() => setEditing({ story: EMPTY, isNew: true })}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-4 py-2.5 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
            title="Créer une fiche vide sans passer par la génération"
          >
            Fiche manuelle
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              <th className="px-4 py-3 font-medium">Actions</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Âge</th>
              <th className="px-4 py-3 font-medium">Durée</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {stories.map((s) => (
              <tr key={s.slug} className="hover:bg-[var(--color-cream-100)]/60">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setViewing(s)}
                      aria-label={`Voir ${s.title}`}
                      title="Voir l'histoire complète"
                      className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing({ story: s, isNew: false })}
                      aria-label={`Modifier ${s.title}`}
                      title="Modifier"
                      className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      aria-label={`Supprimer ${s.title}`}
                      title="Supprimer"
                      className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-64">
                  <span className="block truncate font-medium">{s.title}</span>
                  <span className="block truncate text-xs text-[var(--color-ink-400)]">/{s.slug}</span>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-600)]">{s.genre}</td>
                <td className="px-4 py-3">{s.ageRange} ans</td>
                <td className="px-4 py-3">{s.readingMinutes} min</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[var(--color-fox-500)] text-[var(--color-fox-500)]" />
                    {s.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={s.status === "published" ? "green" : "gray"}>
                    {s.status === "published" ? "Publiée" : "Retirée"}
                  </StatusPill>
                </td>
              </tr>
            ))}
            {stories.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--color-ink-400)]">
                  Aucune histoire.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <StoryDialog
          story={editing.story}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={onSaved}
        />
      )}
      {viewing && <StoryViewDialog story={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}

/**
 * Full story preview — the complete page content (cover, meta, text) in a
 * modal so the admin can check a story without leaving the back-office.
 * Library mock stories pull their text from mock-stories; admin-created ones
 * carry their own body.
 */
function StoryViewDialog({ story, onClose }: { story: AdminStory; onClose: () => void }) {
  const locale = useLocale();
  const mock = findStory(story.slug);
  const body = mock ? storyBody(story.slug, locale) : story.body ?? [];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{story.title}</DialogTitle>
          <DialogDescription>
            {ageLabel(story.ageRange)} · {story.genre} · {story.readingMinutes} min
            {mock?.interactive ? " · interactive" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto pr-1">
          {/* Cover */}
          <div aria-hidden className={cn(mock?.cover ?? "cover-indigo", "aspect-[21/9] w-full rounded-2xl")} />

          {mock?.excerpt && (
            <p className="mt-4 text-sm italic text-[var(--color-ink-600)]">{mock.excerpt}</p>
          )}

          {/* Full text */}
          {body.length > 0 ? (
            <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-[var(--color-ink-700)]">
              {body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-[var(--color-ink-200)] p-4 text-center text-sm text-[var(--color-ink-400)]">
              Texte non disponible pour cette fiche.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-ink-100)] pt-4">
          {mock ? (
            <Link
              href={{ pathname: "/histoires/[slug]", params: { slug: story.slug } }}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-indigo-soft-600)] hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ouvrir la page publique
            </Link>
          ) : (
            <span />
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StoryDialog({
  story,
  isNew,
  onClose,
  onSave,
}: {
  story: AdminStory;
  isNew: boolean;
  onClose: () => void;
  onSave: (next: AdminStory, originalSlug?: string) => void;
}) {
  const [draft, setDraft] = useState<AdminStory>(story);
  const canSave = draft.title.trim().length >= 3;

  function save() {
    const next: AdminStory = { ...draft, slug: draft.slug || slugify(draft.title) };
    onSave(next, isNew ? undefined : story.slug);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nouvelle histoire" : "Modifier l'histoire"}</DialogTitle>
          <DialogDescription>
            {isNew ? "Création manuelle. Le pipeline n8n alimente la bibliothèque automatiquement." : `/${story.slug}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="s-title">Titre</Label>
            <Input id="s-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="s-genre">Genre</Label>
              <select
                id="s-genre"
                value={draft.genre}
                onChange={(e) => setDraft({ ...draft, genre: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2 text-sm"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="s-age">Âge</Label>
              <select
                id="s-age"
                value={draft.ageRange}
                onChange={(e) => setDraft({ ...draft, ageRange: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2 text-sm"
              >
                {AGE_RANGES.map((r) => (
                  <option key={r} value={r}>{r} ans</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="s-mins">Durée (min)</Label>
              <Input
                id="s-mins"
                type="number"
                min={1}
                max={30}
                value={draft.readingMinutes}
                onChange={(e) => setDraft({ ...draft, readingMinutes: Number(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="s-status">Statut</Label>
              <select
                id="s-status"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminStory["status"] })}
                className="mt-1.5 w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2 text-sm"
              >
                <option value="published">Publiée</option>
                <option value="unpublished">Retirée</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-ink-100)] pt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>Annuler</Button>
          <Button variant="primary" size="sm" disabled={!canSave} onClick={save}>
            {isNew ? "Créer" : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
