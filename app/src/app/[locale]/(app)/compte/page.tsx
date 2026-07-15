"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  readProfiles,
  deleteProfile,
  setActiveProfile,
  clearActiveProfile,
  profileLimit,
  type ChildProfile,
} from "@/lib/profiles";
import { readCustomStories, type CustomStory } from "@/lib/customStories";
import { readFavoritesFor } from "@/lib/favorites";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { RecentlyRead } from "./RecentlyRead";
import { ChildAvatar } from "@/components/brand/ChildAvatar";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, Heart, Lock, Pencil, Plus, Trash2, User, Wand2 } from "lucide-react";

/** One dashboard row: who reads + their items. */
type ReaderRow<T> = {
  id: string;
  name: string;
  avatar: ChildProfile["avatar"] | null;
  items: T[];
};

/** Row header: reader avatar + name, shared by favorites + personalized rows. */
function ReaderLabel({ row }: { row: ReaderRow<unknown> }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink-700)]">
      {row.avatar ? (
        <ChildAvatar color={row.avatar} className="h-6 w-6" />
      ) : (
        <User className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
      )}
      {row.name}
    </p>
  );
}

/** Parent dashboard — family overview + quick actions (#11). */
export default function AccountDashboardPage() {
  const t = useTranslations("account");
  const router = useRouter();
  // Entering the parent dashboard = reading as the parent. Drop any active
  // child profile during the first render (before child components read their
  // scoped stores), so favorites / history are the parent's own, never a
  // child's. Guarded for SSR (no localStorage on the server).
  useState(() => {
    if (typeof window !== "undefined") clearActiveProfile();
    return null;
  });

  const [profiles, setProfiles] = useState<ChildProfile[] | null>(null);
  const [customStories, setCustomStories] = useState<CustomStory[]>([]);
  // Favorites + personalized stories organized per reader: the parent's row
  // first, then one row per child.
  const [favoriteRows, setFavoriteRows] = useState<ReaderRow<MockStory>[]>([]);
  const [storyRows, setStoryRows] = useState<ReaderRow<CustomStory>[]>([]);

  useEffect(() => {
    const all = readProfiles();
    setProfiles(all);
    const stories = [...readCustomStories()].reverse();
    setCustomStories(stories);

    const readers = [
      { id: "parent", name: t("readerParent"), avatar: null as ChildProfile["avatar"] | null },
      ...all.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar as ChildProfile["avatar"] | null })),
    ];
    const childIds = new Set(all.map((p) => p.id));

    setFavoriteRows(
      readers
        .map((r) => {
          const favs = readFavoritesFor(r.id);
          return { ...r, items: mockStories.filter((s) => favs.includes(s.slug)).slice(0, 4) };
        })
        .filter((r) => r.items.length > 0)
    );
    setStoryRows(
      readers
        .map((r) => ({
          ...r,
          items: stories
            .filter((s) =>
              r.id === "parent"
                ? !s.profileId || !childIds.has(s.profileId)
                : s.profileId === r.id
            )
            .slice(0, 4),
        }))
        .filter((r) => r.items.length > 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <ChildAvatar color={p.avatar} className="h-14 w-14" />
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
              className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--color-indigo-soft-300)] bg-[var(--color-cream-100)] p-6 text-center hover:border-[var(--color-indigo-soft-500)] transition-colors"
            >
              <Lock className="h-6 w-6 text-[var(--color-indigo-soft-500)]" />
              <p className="text-sm font-semibold text-[var(--color-ink-800)]">{t("addChildLocked")}</p>
              <span className="rounded-full bg-[var(--color-indigo-soft-600)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
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

      {/* Personalized stories — real cards, not just a count */}
      <section>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="font-serif text-2xl tracking-tight sparkle">{t("menu.customStories")}</h2>
          {customStories.length > 0 && (
            <Link
              href="/compte/histoires"
              className="text-sm text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]"
            >
              {t("seeAll")}
            </Link>
          )}
        </div>
        {customStories.length === 0 ? (
          <div className="mt-4 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-8 text-center max-w-xl">
            <Wand2 className="mx-auto h-6 w-6 text-[var(--color-indigo-soft-500)]" />
            <p className="mt-2 text-sm text-[var(--color-ink-600)]">{t("customEmpty")}</p>
            <Button asChild variant="mint" size="md" className="mt-4">
              <Link href="/creer">
                <Wand2 className="h-4 w-4" />
                {t("createStory")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {storyRows.map((row) => (
              <div key={row.id}>
                <ReaderLabel row={row} />
                <div className="mt-2.5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {row.items.map((s) => (
                    <Link
                      key={s.id}
                      href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}
                      className="group overflow-hidden rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
                    >
                      <span className="cover-night flex aspect-[4/3] items-center justify-center">
                        <Wand2 className="h-6 w-6 text-white/70 transition-transform group-hover:scale-110" />
                      </span>
                      <span className="block p-3.5">
                        <span className="block truncate font-serif text-base tracking-tight">{s.title}</span>
                        <span className="mt-0.5 block text-xs text-[var(--color-ink-500)]">
                          {s.params.heroName} · {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Favorites (#30) */}
      <section>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="font-serif text-2xl tracking-tight sparkle">{t("menu.favorites")}</h2>
          {favoriteRows.length > 0 && (
            <Link href="/compte/favoris" className="text-sm text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]">
              {t("seeAll")}
            </Link>
          )}
        </div>
        {favoriteRows.length === 0 ? (
          <div className="mt-4 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-8 text-center max-w-xl">
            <Heart className="mx-auto h-6 w-6 text-[var(--color-indigo-soft-500)]" />
            <p className="mt-2 text-sm text-[var(--color-ink-600)]">{t("favoritesEmpty")}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {favoriteRows.map((row) => (
              <div key={row.id}>
                <ReaderLabel row={row} />
                <div className="mt-2.5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {row.items.map((s) => (
                    <StoryCard key={s.slug} story={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently read (#30) — date + quiz result, carousel past 4 */}
      <RecentlyRead />
    </div>
  );
}
