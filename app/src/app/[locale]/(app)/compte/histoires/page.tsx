"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  readCustomStories,
  deleteCustomStory,
  setCustomStoryImage,
  type CustomStory,
} from "@/lib/customStories";
import {
  listMyCustomStories,
  deleteMyCustomStory,
  fetchCustomStory,
} from "@/app/actions/customStories";
import { readProfiles, type ChildProfile } from "@/lib/profiles";
import { relationLabel } from "@/lib/storyOptions";
import { ChildAvatar } from "@/components/brand/ChildAvatar";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Trash2, User, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SortKey = "newest" | "oldest" | "title";

/**
 * "Mes histoires personnalisées" — a real library, not a list of links:
 * every story is a card with its cover, who it was created by, the hero's age,
 * a short synopsis, its characters, and the actions that matter (read, write
 * the next chapter, delete). Sorting and an author filter sit on top.
 */
export default function CustomStoriesPage() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [stories, setStories] = useState<CustomStory[]>([]);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [author, setAuthor] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    setProfiles(readProfiles());
    // DB-backed stories (this account, any device) merged with the local cache,
    // deduped by id and sorted newest-first. Temp accounts get [] from the DB
    // and still see their local stories.
    const local = readCustomStories();
    listMyCustomStories()
      .then((remote) => {
        if (cancelled) return local;
        const byId = new Map<string, CustomStory>();
        for (const s of [...local, ...remote]) byId.set(s.id, s);
        const merged = [...byId.values()].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
        setStories(merged);
        return merged;
      })
      .catch(() => {
        const fallback = [...local].reverse();
        if (!cancelled) setStories(fallback);
        return fallback;
      })
      .then((list) => {
        // Hydrate covers that exist server-side but were never cached here.
        // Read-only: this never triggers a paid generation.
        list
          .filter((s) => s.id.startsWith("PS-") && !s.imageUrl)
          .forEach((s) => {
            fetchCustomStory(s.id)
              .then((story) => {
                if (cancelled || !story?.imageUrl) return;
                setCustomStoryImage(s.id, story.imageUrl);
                setStories((prev) =>
                  prev.map((x) => (x.id === s.id ? { ...x, imageUrl: story.imageUrl } : x))
                );
              })
              .catch(() => {});
          });
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

  /** Author label: the child's name, or the parent for unattributed stories. */
  const authorName = (s: CustomStory): string =>
    profiles.find((p) => p.id === s.profileId)?.name ?? t("readerParent");

  const visible = useMemo(() => {
    const filtered =
      author === "all"
        ? stories
        : author === "parent"
        ? stories.filter((s) => !s.profileId || !profiles.some((p) => p.id === s.profileId))
        : stories.filter((s) => s.profileId === author);
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, locale);
      const diff = +new Date(a.createdAt) - +new Date(b.createdAt);
      return sort === "oldest" ? diff : -diff;
    });
  }, [stories, author, sort, profiles, locale]);

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm transition-colors",
      active
        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">{t("menu.customStories")}</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">
            {t("storiesCount", { count: stories.length })}
          </p>
        </div>
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
        <>
          {/* Filters: sort, and whose stories to show */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
                {t("sortLabel")}
              </span>
              {(
                [
                  ["newest", t("sortNewest")],
                  ["oldest", t("sortOldest")],
                  ["title", t("sortTitle")],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={pill(sort === key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {profiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
                  {t("filterAuthor")}
                </span>
                <button type="button" onClick={() => setAuthor("all")} className={pill(author === "all")}>
                  {t("filterAll")}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthor("parent")}
                  className={pill(author === "parent")}
                >
                  {t("readerParent")}
                </button>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAuthor(p.id)}
                    className={pill(author === p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink-200)] p-6 text-center text-sm text-[var(--color-ink-500)]">
              {t("noResults")}
            </p>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((s) => {
                const profile = profiles.find((p) => p.id === s.profileId) ?? null;
                const companions = (s.params.companions ?? []).filter((c) => c.name?.trim());
                const synopsis = s.body[0] ?? "";
                return (
                  <li
                    key={s.id}
                    className="flex flex-col overflow-hidden rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
                  >
                    {/* Cover — the real illustration when it exists */}
                    <Link
                      href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}
                      className="group block"
                    >
                      {s.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.imageUrl}
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

                    <div className="flex flex-1 flex-col p-4">
                      <Link href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}>
                        <h2 className="font-serif text-lg leading-snug tracking-tight hover:text-[var(--color-indigo-soft-700)]">
                          {s.title}
                        </h2>
                      </Link>

                      {/* Author + date */}
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-500)]">
                        {profile ? (
                          <ChildAvatar color={profile.avatar} className="h-4 w-4" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-[var(--color-indigo-soft-500)]" />
                        )}
                        {t("storyBy", { name: authorName(s) })}
                        <span aria-hidden>·</span>
                        {new Date(s.createdAt).toLocaleDateString(locale)}
                      </p>

                      {/* Hero + age */}
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[var(--color-mint-100)] px-2.5 py-0.5 text-[11px] text-[var(--color-ink-700)]">
                          {s.params.heroName}
                        </span>
                        <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-[11px] text-[var(--color-ink-600)]">
                          {t("storyAge", { age: s.params.readingAge ?? s.params.heroAge })}
                        </span>
                      </p>

                      {/* Synopsis */}
                      {synopsis && (
                        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-600)]">
                          {synopsis}
                        </p>
                      )}

                      {/* Characters */}
                      {companions.length > 0 && (
                        <p className="mt-2.5 text-[11px] text-[var(--color-ink-400)]">
                          <span className="uppercase tracking-wider">{t("storyCharacters")}</span>{" "}
                          {companions
                            .map((c) => `${c.name} (${relationLabel(c.relation, locale)})`)
                            .join(", ")}
                        </p>
                      )}

                      {/* Actions, pinned to the bottom so cards line up */}
                      <div className="mt-auto space-y-2 pt-4">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="mint" size="sm" className="flex-1">
                            <Link href={{ pathname: "/histoire-perso/[id]", params: { id: s.id } }}>
                              <BookOpen className="h-4 w-4" />
                              {t("storyRead")}
                            </Link>
                          </Button>
                          <button
                            type="button"
                            onClick={() => remove(s)}
                            aria-label={t("deleteStory")}
                            title={t("deleteStory")}
                            className="shrink-0 rounded-xl border border-[var(--color-ink-100)] p-2 text-[var(--color-ink-400)] hover:border-[var(--color-fox-300)] hover:text-[var(--color-fox-700)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Spelled out: an icon alone read as decoration */}
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={{ pathname: "/creer", query: { from: s.id } } as never}>
                            <Sparkles className="h-4 w-4" />
                            {t("storyNextChapter")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
