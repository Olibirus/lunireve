"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { mockStories, ageLabel, type MockStory } from "@/data/mock-stories";
import {
  readCustomStories,
  setCustomStoryImage,
  type CustomStory,
} from "@/lib/customStories";
import { listMyCustomStories, fetchCustomStory } from "@/app/actions/customStories";
import { readFavorites, toggleFavorite } from "@/lib/favorites";
import { storyCardImageSrc } from "@/lib/storyImage";
import { BookOpen, Clock, Heart, Sparkles, Star, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** One favorite, normalized so library and personalized stories share a card. */
type FavItem = {
  key: string;
  title: string;
  href:
    | { pathname: "/histoires/[slug]"; params: { slug: string } }
    | { pathname: "/histoire-perso/[id]"; params: { id: string } };
  image: string | null;
  excerpt: string;
  ageRange: string;
  minutes: number | null;
  rating: number | null;
  personalized: boolean;
  /** Personalized stories can spawn a sequel; library ones cannot. */
  sequelFrom: string | null;
};

/**
 * Favorites — same card language as "Mes histoires personnalisées": cover,
 * synopsis, age, rating and reading time, with Read / next-chapter actions and
 * a filled heart in the corner that un-favorites on click.
 */
export default function FavoritesPage() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [items, setItems] = useState<FavItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fromLibrary = (s: MockStory): FavItem => ({
      key: s.slug,
      title: s.title,
      href: { pathname: "/histoires/[slug]", params: { slug: s.slug } },
      image: storyCardImageSrc(s.slug),
      excerpt: s.excerpt,
      ageRange: s.ageRange,
      minutes: s.readingMinutes,
      rating: s.rating > 0 ? s.rating : null,
      personalized: false,
      sequelFrom: null,
    });

    const fromCustom = (s: CustomStory): FavItem => ({
      key: s.id,
      title: s.title,
      href: { pathname: "/histoire-perso/[id]", params: { id: s.id } },
      image: s.imageUrl ?? null,
      excerpt: s.body[0] ?? "",
      ageRange: String(s.params.readingAge ?? s.params.heroAge),
      // Personalized stories carry no rating and no measured duration; the
      // word count gives an honest reading estimate (~140 wpm read aloud).
      minutes: Math.max(1, Math.round(s.body.join(" ").split(/\s+/).length / 140)),
      rating: null,
      personalized: true,
      sequelFrom: s.id,
    });

    const build = (custom: CustomStory[]) => {
      const list = readFavorites();
      return [
        ...mockStories.filter((s) => list.includes(s.slug)).map(fromLibrary),
        ...custom.filter((s) => list.includes(s.id)).map(fromCustom),
      ];
    };

    const local = readCustomStories();
    setItems(build(local));

    // Same merge as the stories library, so a favorite created on another
    // device still shows up with its cover.
    listMyCustomStories()
      .then((remote) => {
        if (cancelled) return local;
        const byId = new Map<string, CustomStory>();
        for (const s of [...local, ...remote]) byId.set(s.id, s);
        const merged = [...byId.values()];
        setItems(build(merged));
        return merged;
      })
      .catch(() => local)
      .then((custom) => {
        const favs = readFavorites();
        custom
          .filter((s) => favs.includes(s.id) && s.id.startsWith("PS-") && !s.imageUrl)
          .forEach((s) => {
            fetchCustomStory(s.id)
              .then((story) => {
                if (cancelled || !story?.imageUrl) return;
                setCustomStoryImage(s.id, story.imageUrl);
                setItems((prev) =>
                  prev
                    ? prev.map((x) => (x.key === s.id ? { ...x, image: story.imageUrl! } : x))
                    : prev
                );
              })
              .catch(() => {});
          });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Un-favorite straight from the card: the heart empties, the card leaves. */
  function unfavorite(key: string) {
    toggleFavorite(key);
    setItems((prev) => (prev ? prev.filter((x) => x.key !== key) : prev));
  }

  const empty = items !== null && items.length === 0;

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

      {empty ? (
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
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items?.map((s) => (
            <li
              key={s.key}
              className="flex flex-col overflow-hidden rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative">
                <Link href={s.href} className="group block">
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="cover-night flex aspect-[4/3] w-full items-center justify-center">
                      <Wand2 className="h-7 w-7 text-white/70 transition-transform group-hover:scale-110" />
                    </span>
                  )}
                </Link>
                {/* Filled heart = favorited. Click empties it and drops the card. */}
                <button
                  type="button"
                  onClick={() => unfavorite(s.key)}
                  aria-label={t("favUnfavorite")}
                  title={t("favUnfavorite")}
                  aria-pressed
                  className="group/heart absolute right-2.5 top-2.5 rounded-full bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/45"
                >
                  <Heart className="h-4 w-4 fill-[var(--color-fox-500)] text-[var(--color-fox-500)] group-hover/heart:fill-transparent group-hover/heart:text-white" />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <Link href={s.href}>
                  <h2 className="font-serif text-lg leading-snug tracking-tight hover:text-[var(--color-indigo-soft-700)]">
                    {s.title}
                  </h2>
                </Link>

                {/* Age, reading time, rating */}
                <p className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-[11px] text-[var(--color-ink-600)]">
                    {s.personalized ? t("storyAge", { age: s.ageRange }) : ageLabel(s.ageRange)}
                  </span>
                  {s.minutes !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-[11px] text-[var(--color-ink-600)]">
                      <Clock className="h-3 w-3" />
                      {t("favMinutes", { count: s.minutes })}
                    </span>
                  )}
                  {s.rating !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-[11px] text-[var(--color-ink-600)]">
                      <Star className="h-3 w-3 fill-[var(--color-fox-500)] text-[var(--color-fox-500)]" />
                      {t("favRating", { rating: s.rating.toFixed(1) })}
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px]",
                      s.personalized
                        ? "bg-[var(--color-mint-100)] text-[var(--color-ink-700)]"
                        : "bg-[var(--color-indigo-soft-100)] text-[var(--color-indigo-soft-700)]"
                    )}
                  >
                    {s.personalized ? t("favPersonalized") : t("favLibrary")}
                  </span>
                </p>

                {s.excerpt && (
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-600)]">
                    {s.excerpt}
                  </p>
                )}

                <div className="mt-auto space-y-2 pt-4">
                  <Button asChild variant="mint" size="sm" className="w-full">
                    <Link href={s.href}>
                      <BookOpen className="h-4 w-4" />
                      {t("storyRead")}
                    </Link>
                  </Button>
                  {s.sequelFrom && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={{ pathname: "/creer", query: { from: s.sequelFrom } } as never}>
                        <Sparkles className="h-4 w-4" />
                        {t("storyNextChapter")}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
