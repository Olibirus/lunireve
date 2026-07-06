"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/story/StoryCard";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { readCustomStories, type CustomStory } from "@/lib/customStories";
import { readFavorites } from "@/lib/favorites";
import { BookOpen, Heart, Wand2 } from "lucide-react";

/** Favorites — every story hearted from cards or story pages, incl. personalized ones. */
export default function FavoritesPage() {
  const t = useTranslations("account");
  const [favorites, setFavorites] = useState<MockStory[]>([]);
  const [customFavorites, setCustomFavorites] = useState<CustomStory[]>([]);

  useEffect(() => {
    const list = readFavorites();
    setFavorites(mockStories.filter((s) => list.includes(s.slug)));
    setCustomFavorites(readCustomStories().filter((s) => list.includes(s.id)));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight">{t("menu.favorites")}</h1>
        <Button asChild variant="primary" size="md">
          <Link href="/histoires">
            <BookOpen className="h-4 w-4" />
            {t("favoritesBrowseCta")}
          </Link>
        </Button>
      </div>
      {favorites.length === 0 && customFavorites.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-10 text-center max-w-xl">
          <Heart className="mx-auto h-7 w-7 text-[var(--color-indigo-soft-500)]" />
          <p className="mt-3 text-[var(--color-ink-600)]">{t("favoritesEmpty")}</p>
          <Button asChild variant="mint" size="md" className="mt-5">
            <Link href="/histoires">
              <BookOpen className="h-4 w-4" />
              {t("favoritesBrowseCta")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {favorites.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
          {customFavorites.length > 0 && (
            <ul className="mt-5 space-y-3 max-w-2xl">
              {customFavorites.map((s) => (
                <li key={s.id}>
                  <Link
                    href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}
                    className="flex items-center gap-4 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
                  >
                    <span aria-hidden className="cover-night flex h-14 w-11 shrink-0 items-center justify-center rounded-xl">
                      <Wand2 className="h-4 w-4 text-white/80" />
                    </span>
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
        </>
      )}
    </div>
  );
}
