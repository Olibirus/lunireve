"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/story/StoryCard";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { readFavorites } from "@/lib/favorites";
import { BookOpen, Heart } from "lucide-react";

/** Favorites — every story hearted from cards or story pages. */
export default function FavoritesPage() {
  const t = useTranslations("account");
  const [favorites, setFavorites] = useState<MockStory[]>([]);

  useEffect(() => {
    const list = readFavorites();
    setFavorites(mockStories.filter((s) => list.includes(s.slug)));
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
      {favorites.length === 0 ? (
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
        <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      )}
    </div>
  );
}
