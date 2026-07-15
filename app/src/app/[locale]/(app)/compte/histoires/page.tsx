"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  readCustomStories,
  deleteCustomStory,
  type CustomStory,
} from "@/lib/customStories";
import { listMyCustomStories, deleteMyCustomStory } from "@/app/actions/customStories";
import { Button } from "@/components/ui/button";
import { Trash2, Wand2 } from "lucide-react";

/** Personalized stories — each opens its own shareable URL (#14). */
export default function CustomStoriesPage() {
  const t = useTranslations("account");
  const [stories, setStories] = useState<CustomStory[]>([]);

  useEffect(() => {
    let cancelled = false;
    // DB-backed stories (this account, any device) merged with the local cache,
    // deduped by id and sorted newest-first. Temp accounts get [] from the DB
    // and still see their local stories.
    const local = readCustomStories();
    listMyCustomStories()
      .then((remote) => {
        if (cancelled) return;
        const byId = new Map<string, CustomStory>();
        for (const s of [...local, ...remote]) byId.set(s.id, s);
        const merged = [...byId.values()].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
        setStories(merged);
      })
      .catch(() => {
        if (!cancelled) setStories([...local].reverse());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Delete everywhere: local cache + DB row (when it is a DB-backed story). */
  async function remove(s: CustomStory) {
    if (!window.confirm(t("deleteStoryConfirm", { title: s.title }))) return;
    deleteCustomStory(s.id);
    setStories((prev) => prev.filter((x) => x.id !== s.id));
    if (s.id.startsWith("PS-")) {
      try {
        await deleteMyCustomStory(s.id);
      } catch {
        /* local copy already gone; the row delete is best-effort */
      }
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight">{t("menu.customStories")}</h1>
        <Button asChild variant="primary" size="sm">
          <Link href="/creer">
            <Wand2 className="h-4 w-4" />
            {t("createStory")}
          </Link>
        </Button>
      </div>

      {stories.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-10 text-center max-w-xl">
          <Wand2 className="mx-auto h-7 w-7 text-[var(--color-indigo-soft-500)]" />
          <p className="mt-3 text-[var(--color-ink-600)]">{t("customEmpty")}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3 max-w-2xl">
          {stories.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              <Link
                href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <span aria-hidden className="cover-night h-14 w-11 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-lg">{s.title}</span>
                  <span className="block text-xs text-[var(--color-ink-500)]">
                    {s.params.heroName} · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => remove(s)}
                aria-label={t("deleteStory")}
                title={t("deleteStory")}
                className="shrink-0 rounded-xl border border-[var(--color-ink-100)] p-2.5 text-[var(--color-ink-400)] hover:border-[var(--color-fox-300)] hover:text-[var(--color-fox-700)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
