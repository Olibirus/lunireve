"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readCustomStories, type CustomStory } from "@/lib/customStories";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

/** Personalized stories — each opens its own shareable URL (#14). */
export default function CustomStoriesPage() {
  const t = useTranslations("account");
  const [stories, setStories] = useState<CustomStory[]>([]);

  useEffect(() => {
    setStories([...readCustomStories()].reverse());
  }, []);

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
            <li key={s.id}>
              <Link
                href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}
                className="flex items-center gap-4 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
              >
                <span aria-hidden className="cover-night h-14 w-11 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-lg">{s.title}</span>
                  <span className="block text-xs text-[var(--color-ink-500)]">
                    {s.params.heroName} · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
