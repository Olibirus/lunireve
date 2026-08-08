"use client";

import { useEffect, useRef, useState } from "react";
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
import { readCustomStories, setCustomStoryImage, type CustomStory } from "@/lib/customStories";
import { fetchCustomStory } from "@/app/actions/customStories";
import { readFavoritesFor } from "@/lib/favorites";
import { readHistoryFor } from "@/lib/readingHistory";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { RecentlyRead } from "./RecentlyRead";
import { ChildAvatar } from "@/components/brand/ChildAvatar";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight, Flame, Heart, Lock, Pencil, Plus, Trash2, User, Wand2 } from "lucide-react";

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
    <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-600)]">
      {row.avatar ? (
        <ChildAvatar color={row.avatar} className="h-5 w-5" />
      ) : (
        <User className="h-3.5 w-3.5 text-[var(--color-indigo-soft-500)]" />
      )}
      {row.name}
    </p>
  );
}

/**
 * One personalized-stories row: compact reader card pinned LEFT, that
 * reader's stories as a horizontal carousel on the right (newest first,
 * arrows page back toward the oldest).
 */
function StoryRowCarousel({ row }: { row: ReaderRow<CustomStory> }) {
  const scroller = useRef<HTMLDivElement>(null);
  // Arrows appear only when the row actually overflows, and each side only
  // when there is somewhere to go: no left arrow on the newest story, no
  // right arrow once the oldest is reached.
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      // 1px tolerance: fractional widths never leave a dead arrow behind.
      setCanLeft(el.scrollLeft > 1);
      setCanRight(el.scrollLeft < max - 1);
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [row.items.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-4">
      {/* Reader: bare round avatar + name, no card chrome */}
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5">
        {row.avatar ? (
          <ChildAvatar color={row.avatar} className="h-18 w-18" />
        ) : (
          <span className="flex h-18 w-18 items-center justify-center rounded-full bg-[var(--color-cream-200)]">
            <User className="h-8 w-8 text-[var(--color-indigo-soft-500)]" />
          </span>
        )}
        <span className="w-full truncate text-center text-xs font-medium text-[var(--color-ink-600)]">
          {row.name}
        </span>
      </div>

      {/* Carousel */}
      <div className="relative min-w-0 flex-1">
        <div
          ref={scroller}
          className="flex h-full gap-4 overflow-x-auto scroll-smooth snap-x pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {row.items.map((s) => (
            <Link
              key={s.id}
              href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}
              className="group w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              {/* Real story cover when the illustration exists; night sky as
                  the pre-generation placeholder */}
              {s.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.imageUrl}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <span className="cover-night flex aspect-[4/3] items-center justify-center">
                  <Wand2 className="h-6 w-6 text-white/70 transition-transform group-hover:scale-110" />
                </span>
              )}
              <span className="block p-3">
                <span className="block truncate font-serif text-[15px] tracking-tight">{s.title}</span>
                <span className="mt-0.5 block text-[11px] text-[var(--color-ink-500)]">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </span>
            </Link>
          ))}
        </div>
        {canLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="previous"
            className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-1.5 text-[var(--color-ink-600)] shadow-[var(--shadow-soft)] hover:bg-[var(--color-cream-100)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="next"
            className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-1.5 text-[var(--color-ink-600)] shadow-[var(--shadow-soft)] hover:bg-[var(--color-cream-100)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
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
  /** Per-child mini stats for the family cards: stories read + created. */
  const [childStats, setChildStats] = useState<Record<string, { read: number; created: number }>>({});
  // Favorites + personalized stories organized per reader: the parent's row
  // first, then one row per child.
  const [favoriteRows, setFavoriteRows] = useState<ReaderRow<MockStory>[]>([]);
  const [storyRows, setStoryRows] = useState<ReaderRow<CustomStory>[]>([]);

  useEffect(() => {
    const all = readProfiles();
    setProfiles(all);
    const stories = [...readCustomStories()].reverse();
    setCustomStories(stories);

    // Mini stats per child: stories actually read (history entries) and
    // personalized stories created for them.
    setChildStats(
      Object.fromEntries(
        all.map((p) => [
          p.id,
          {
            read: readHistoryFor(p.id).length,
            created: stories.filter((s) => s.profileId === p.id).length,
          },
        ])
      )
    );

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
          // Full list, newest first: the row is a carousel (arrows page back
          // to the oldest), not a truncated grid.
          items: stories.filter((s) =>
            r.id === "parent"
              ? !s.profileId || !childIds.has(s.profileId)
              : s.profileId === r.id
          ),
        }))
        .filter((r) => r.items.length > 0)
    );

    // Real covers on the cards: DB-backed stories whose illustration exists
    // but was never cached on this device get it hydrated here (read-only
    // lookup, never triggers a paid generation).
    stories
      .filter((s) => s.id.startsWith("PS-") && !s.imageUrl)
      .forEach((s) => {
        fetchCustomStory(s.id)
          .then((remote) => {
            if (!remote?.imageUrl) return;
            setCustomStoryImage(s.id, remote.imageUrl);
            setStoryRows((rows) =>
              rows.map((r) => ({
                ...r,
                items: r.items.map((it) =>
                  it.id === s.id ? { ...it, imageUrl: remote.imageUrl } : it
                ),
              }))
            );
          })
          .catch(() => {});
      });
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
              </div>

              {/* Mini stats: read / created / streak, at a glance */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    icon: <BookOpen className="h-3.5 w-3.5" />,
                    value: childStats[p.id]?.read ?? 0,
                    label: t("statRead"),
                  },
                  {
                    icon: <Wand2 className="h-3.5 w-3.5" />,
                    value: childStats[p.id]?.created ?? 0,
                    label: t("statCreated"),
                  },
                  {
                    icon: <Flame className="h-3.5 w-3.5 text-[var(--color-fox-700)]" />,
                    value: p.streak,
                    label: t("statStreak"),
                  },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl bg-[var(--color-cream-100)] px-2 py-2">
                    <span className="flex items-center justify-center gap-1 text-sm font-semibold text-[var(--color-ink-800)]">
                      {s.icon}
                      {s.value}
                    </span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--color-ink-500)]">
                      {s.label}
                    </span>
                  </div>
                ))}
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
              href="/compte/abonnement"
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
          <div className="mt-4 space-y-4">
            {storyRows.map((row) => (
              <StoryRowCarousel key={row.id} row={row} />
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
