"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  readProfiles,
  deleteProfile,
  setActiveProfile,
  profileLimit,
  type ChildProfile,
} from "@/lib/profiles";
import { readCustomStories } from "@/lib/customStories";
import { readFavorites } from "@/lib/favorites";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, Heart, Lock, Pencil, Plus, Trash2, Wand2 } from "lucide-react";

/** Parent dashboard — family overview + quick actions (#11). */
export default function AccountDashboardPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const [profiles, setProfiles] = useState<ChildProfile[] | null>(null);
  const [storyCount, setStoryCount] = useState(0);
  const [favorites, setFavorites] = useState<MockStory[]>([]);
  const [recent, setRecent] = useState<MockStory[]>([]);

  useEffect(() => {
    setProfiles(readProfiles());
    setStoryCount(readCustomStories().length);
    const favs = readFavorites();
    setFavorites(mockStories.filter((s) => favs.includes(s.slug)).slice(0, 4));
    // Recently read = stories with any saved reading progress, newest first
    const read: MockStory[] = [];
    for (const s of mockStories) {
      const v = Number(localStorage.getItem(`lunireve:progress:${s.slug}`) ?? "0");
      if (v > 0) read.push(s);
    }
    setRecent(read.slice(0, 4));
  }, []);

  function openChild(p: ChildProfile) {
    setActiveProfile(p.id);
    router.push("/enfant");
  }

  function removeChild(p: ChildProfile) {
    if (!window.confirm(t("deleteConfirm", { name: p.name }))) return;
    deleteProfile(p.id);
    setProfiles(readProfiles());
  }

  const limitReached = (profiles?.length ?? 0) >= profileLimit();

  return (
    <div className="space-y-10">
      <div>
        <h1
          className="font-serif text-3xl md:text-4xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("title")}
        </h1>
        <p className="mt-2 text-[var(--color-ink-500)]">{t("subtitle")}</p>
      </div>

      <section className="flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/creer">
            <Wand2 className="h-4 w-4" />
            {t("createStory")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/histoires">
            <BookOpen className="h-4 w-4" />
            {t("browseLibrary")}
          </Link>
        </Button>
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight sparkle">{t("family")}</h2>
        <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {profiles?.map((p) => (
            <article
              key={p.id}
              className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-3">
                <FoxMark color={p.avatar} className="h-14 w-14" />
                <div>
                  <p className="font-serif text-lg tracking-tight">{p.name}</p>
                  <p className="text-xs text-[var(--color-ink-500)]">
                    {t("childMeta", { age: p.age })}
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--color-fox-300)]/25 px-2 py-0.5 text-xs text-[var(--color-fox-700)]">
                  <Flame className="h-3 w-3" />
                  {p.streak}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openChild(p)}
                  className="flex-1 rounded-xl bg-[var(--color-ink-800)] px-3 py-2 text-xs text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
                >
                  {t("openProfile")}
                </button>
                <Link
                  href={{ pathname: "/profils/[id]", params: { id: p.id } }}
                  aria-label={t("editProfile")}
                  className="rounded-xl border border-[var(--color-ink-100)] px-3 py-2 text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)] hover:border-[var(--color-ink-200)]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => removeChild(p)}
                  aria-label={t("deleteProfile")}
                  className="rounded-xl border border-[var(--color-ink-100)] px-3 py-2 text-[var(--color-ink-500)] hover:text-[var(--color-fox-700)] hover:border-[var(--color-fox-300)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}

          {limitReached ? (
            <Link
              href="/tarifs"
              className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--color-indigo-soft-300)] bg-[var(--color-indigo-soft-50)] p-6 text-center hover:border-[var(--color-indigo-soft-500)] transition-colors"
            >
              <Lock className="h-6 w-6 text-[var(--color-indigo-soft-500)]" />
              <p className="text-sm font-medium text-[var(--color-ink-700)]">{t("addChildLocked")}</p>
              <span className="rounded-full bg-[var(--color-indigo-soft-200)] px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--color-indigo-soft-700)]">
                {t("upgradeBadge")}
              </span>
            </Link>
          ) : (
            <Link
              href="/profils/nouveau"
              className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] p-6 text-center text-[var(--color-ink-500)] hover:border-[var(--color-mint-500)] hover:text-[var(--color-ink-800)] transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">{t("addChild")}</span>
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight sparkle">{t("menu.customStories")}</h2>
        <p className="mt-3 text-sm text-[var(--color-ink-500)]">
          {t("customCount", { count: storyCount })}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/compte/histoires">{t("seeAll")}</Link>
        </Button>
      </section>

      {/* Favorites (#30) */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-tight sparkle">{t("menu.favorites")}</h2>
          {favorites.length > 0 && (
            <Link href="/compte/favoris" className="text-sm text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]">
              {t("seeAll")}
            </Link>
          )}
        </div>
        {favorites.length === 0 ? (
          <div className="mt-4 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-8 text-center max-w-xl">
            <Heart className="mx-auto h-6 w-6 text-[var(--color-indigo-soft-500)]" />
            <p className="mt-2 text-sm text-[var(--color-ink-600)]">{t("favoritesEmpty")}</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        )}
      </section>

      {/* Recently read (#30) */}
      {recent.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl tracking-tight sparkle">{t("recentlyRead")}</h2>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
