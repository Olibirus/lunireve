import { mockStories } from "@/data/mock-stories";
import { StatusPill } from "@/components/admin/AdminShell";
import { Headphones, Pencil, Plus, Star, Trash2 } from "lucide-react";

/**
 * Stories CRUD — read-only table on mock data; create/edit/delete actions
 * are wired to the DB in the n8n/Supabase batch. Bank stories auto-publish
 * (brief decision #37) — admin can unpublish from here.
 */
export default function AdminStoriesPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Histoires</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">
            {mockStories.length} histoires publiées · publication automatique, retrait manuel
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ink-800)] px-4 py-2.5 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
        >
          <Plus className="h-4 w-4" />
          Nouvelle histoire
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Âge</th>
              <th className="px-4 py-3 font-medium">Durée</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">Audio</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {mockStories.map((s) => (
              <tr key={s.slug} className="hover:bg-[var(--color-cream-100)]/60">
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
                  {s.hasAudio ? (
                    <Headphones className="h-4 w-4 text-[var(--color-mint-700)]" />
                  ) : (
                    <span className="text-xs text-[var(--color-ink-300)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone="green">Publiée</StatusPill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Modifier ${s.title}`}
                      className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${s.title}`}
                      className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
