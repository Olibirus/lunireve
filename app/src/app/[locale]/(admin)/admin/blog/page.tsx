"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { readArticles, deleteArticle, type AdminArticle } from "@/lib/adminBlog";
import { StatusPill } from "@/components/admin/AdminShell";
import { Pencil, Plus, Trash2 } from "lucide-react";

/** Blog CMS list (#13) — create, edit, delete real articles. */
export default function AdminBlogPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);

  useEffect(() => {
    setArticles(readArticles());
  }, []);

  function remove(slug: string, title: string) {
    if (!window.confirm(`Supprimer l'article « ${title} » ?`)) return;
    deleteArticle(slug);
    setArticles(readArticles());
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">
            Rédigez et publiez des articles. Édition complète, comme un vrai CMS.
          </p>
        </div>
        <Link
          href={{ pathname: "/admin/blog/[slug]", params: { slug: "nouveau" } }}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ink-800)] px-4 py-2.5 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Publication</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {articles.map((p) => (
              <tr key={p.slug} className="hover:bg-[var(--color-cream-100)]/60">
                <td className="px-4 py-3 max-w-80">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-[var(--color-ink-400)]">/blog/{p.slug}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={p.status === "published" ? "green" : "gray"}>
                    {p.status === "published" ? "Publié" : "Brouillon"}
                  </StatusPill>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-500)]">{p.publishedAt ?? "·"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={{ pathname: "/admin/blog/[slug]", params: { slug: p.slug } }}
                      aria-label={`Modifier ${p.title}`}
                      className="rounded-lg p-2 text-[var(--color-ink-500)] hover:bg-[var(--color-cream-200)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(p.slug, p.title)}
                      aria-label={`Supprimer ${p.title}`}
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
