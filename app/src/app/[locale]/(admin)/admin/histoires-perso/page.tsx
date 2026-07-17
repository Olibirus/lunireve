"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  listAllCustomStoriesAdmin,
  adminUpdateCustomStoryTitle,
  adminDeleteCustomStory,
} from "@/app/actions/customStories";
import type { AdminCustomStoryRow } from "@/db/customStories";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ageLabel } from "@/data/mock-stories";
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
import { ExternalLink, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Personalized stories back-office: every story created by users (REAL rows
 * from the stories table), with hero, age, parent thumbs, shares, owner.
 * Sortable headers + Excel-style filters via DataTable; edit (rename) and
 * delete act on the DB through admin-gated server actions.
 */
export default function AdminCustomStoriesPage() {
  const [rows, setRows] = useState<AdminCustomStoryRow[] | null>(null);
  const [editing, setEditing] = useState<AdminCustomStoryRow | null>(null);

  useEffect(() => {
    listAllCustomStoriesAdmin()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  async function remove(row: AdminCustomStoryRow) {
    if (!window.confirm(`Supprimer l'histoire « ${row.title} » ? Le lien partagé cessera de fonctionner.`)) return;
    const { ok } = await adminDeleteCustomStory(row.id);
    if (ok) setRows((prev) => (prev ?? []).filter((r) => r.id !== row.id));
    else window.alert("Suppression impossible (base indisponible ?).");
  }

  async function rename(row: AdminCustomStoryRow, title: string) {
    const { ok } = await adminUpdateCustomStoryTitle(row.id, title);
    if (ok) setRows((prev) => (prev ?? []).map((r) => (r.id === row.id ? { ...r, title } : r)));
    else window.alert("Renommage impossible (base indisponible ?).");
    setEditing(null);
  }

  const columns = useMemo<Column<AdminCustomStoryRow>[]>(
    () => [
      {
        // Actions on the far left, per feedback.
        key: "actions",
        label: "Actions",
        type: "num",
        sortVal: () => "",
        cell: (r) => (
          <span className="flex gap-1">
            <Link
              href={{ pathname: "/histoire-perso/[id]", params: { id: r.id } }}
              target="_blank"
              aria-label={`Voir ${r.title}`}
              title="Voir l'histoire"
              className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)]"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setEditing(r)}
              aria-label={`Modifier ${r.title}`}
              title="Modifier"
              className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)]"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void remove(r)}
              aria-label={`Supprimer ${r.title}`}
              title="Supprimer"
              className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </span>
        ),
        exp: () => "",
      },
      {
        key: "title",
        label: "Titre",
        type: "text",
        sortVal: (r) => r.title.toLowerCase(),
        filterVal: (r) => r.title,
        cell: (r) => (
          <span className="block max-w-56">
            <span className="block truncate font-medium">{r.title}</span>
            <span className="block truncate text-xs text-[var(--color-ink-400)]">{r.id}</span>
          </span>
        ),
        exp: (r) => r.title,
      },
      {
        key: "hero",
        label: "Héros",
        type: "text",
        sortVal: (r) => r.heroName.toLowerCase(),
        filterVal: (r) => r.heroName,
        cell: (r) => `${r.heroName}, ${r.heroAge} ans`,
        exp: (r) => `${r.heroName} (${r.heroAge})`,
      },
      {
        key: "ageRange",
        label: "Âge cible",
        type: "cat",
        sortVal: (r) => Number(r.ageRange.split("-")[0]) || 0,
        filterVal: (r) => (r.ageRange ? ageLabel(r.ageRange) : "·"),
        cell: (r) => (r.ageRange ? ageLabel(r.ageRange) : "·"),
      },
      {
        key: "theme",
        label: "Thème",
        type: "cat",
        sortVal: (r) => r.theme,
        filterVal: (r) => cap(r.theme),
        cell: (r) => cap(r.theme),
      },
      {
        key: "language",
        label: "Langue",
        type: "cat",
        sortVal: (r) => r.language,
        filterVal: (r) => r.language.toUpperCase(),
        cell: (r) => r.language.toUpperCase(),
      },
      {
        key: "feedback",
        label: "Avis parents",
        type: "num",
        sortVal: (r) => r.thumbsUp - r.thumbsDown,
        cell: (r) =>
          r.thumbsUp || r.thumbsDown ? (
            <span className="inline-flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 text-[var(--color-mint-700)]">
                <ThumbsUp className="h-3.5 w-3.5" />
                {r.thumbsUp}
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--color-fox-600)]">
                <ThumbsDown className="h-3.5 w-3.5" />
                {r.thumbsDown}
              </span>
            </span>
          ) : (
            "·"
          ),
        exp: (r) => `+${r.thumbsUp} / -${r.thumbsDown}`,
      },
      {
        key: "shares",
        label: "Partages",
        type: "num",
        sortVal: (r) => r.shares,
        cell: (r) => (r.shares ? r.shares : "·"),
        exp: (r) => r.shares,
      },
      {
        key: "owner",
        label: "Créée par",
        type: "text",
        sortVal: (r) => r.ownerUserId ?? "",
        filterVal: (r) => r.ownerUserId ?? "invité",
        cell: (r) =>
          r.ownerUserId ? (
            <span className="font-mono text-xs">{r.ownerUserId.slice(0, 8)}…</span>
          ) : (
            <span className="text-[var(--color-ink-400)]">invité</span>
          ),
        exp: (r) => r.ownerUserId ?? "invité",
      },
      {
        key: "createdAt",
        label: "Créée le",
        type: "num",
        sortVal: (r) => r.createdAt,
        cell: (r) => (
          <span className="text-[var(--color-ink-500)]">
            {new Date(r.createdAt).toLocaleDateString("fr-FR")}
          </span>
        ),
        exp: (r) => r.createdAt.slice(0, 10),
      },
    ],
    []
  );

  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Histoires personnalisées</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        Toutes les histoires créées par les utilisateurs (données réelles). Triez par en-tête,
        filtrez avec l&apos;entonnoir; les avis viennent des pouces des parents.
      </p>

      <div className="mt-8">
        {rows === null ? (
          <p className="rounded-2xl border border-dashed border-[var(--color-ink-200)] p-6 text-center text-sm text-[var(--color-ink-400)]">
            Chargement…
          </p>
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            initialSortKey="createdAt"
            initialSortDir="desc"
            exportTitle="Histoires personnalisées"
            emptyText="Aucune histoire personnalisée pour l'instant. Elles apparaîtront dès la première création."
            unit="histoires"
          />
        )}
      </div>

      {editing && (
        <RenameDialog story={editing} onClose={() => setEditing(null)} onSave={rename} />
      )}
    </>
  );
}

function RenameDialog({
  story,
  onClose,
  onSave,
}: {
  story: AdminCustomStoryRow;
  onClose: () => void;
  onSave: (story: AdminCustomStoryRow, title: string) => void;
}) {
  const [title, setTitle] = useState(story.title);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;histoire</DialogTitle>
          <DialogDescription>
            {story.id} · héros {story.heroName}, {story.heroAge} ans
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="cs-title">Titre</Label>
          <Input id="cs-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--color-ink-100)] pt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            size="sm"
            disabled={title.trim().length < 3}
            onClick={() => onSave(story, title.trim())}
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
