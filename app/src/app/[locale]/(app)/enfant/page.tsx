"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  getActiveProfile,
  clearActiveProfile,
  type ChildProfile,
} from "@/lib/profiles";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { readCustomStories, type CustomStory } from "@/lib/customStories";
import { StoryCard } from "@/components/story/StoryCard";
import { FoxMark } from "@/components/brand/FoxCloud";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BookOpen, Flame, LogOut, Sparkles, Wand2 } from "lucide-react";

/**
 * Child bubble — the simplified, child-addressed lens on the library.
 * Pre-filtered by the profile's age + favourite themes; no settings, no
 * billing, no submissions visible. Top-bar-only navigation, bigger type.
 */
export default function ChildBubblePage() {
  const t = useTranslations("child");
  const router = useRouter();
  const [profile, setProfile] = useState<ChildProfile | null | undefined>(undefined);
  const [resume, setResume] = useState<{ story: MockStory; progress: number } | null>(null);
  const [favorites, setFavorites] = useState<MockStory[]>([]);
  const [custom, setCustom] = useState<CustomStory[]>([]);

  useEffect(() => {
    const p = getActiveProfile();
    setProfile(p ?? null);
    if (!p) return;

    setCustom(readCustomStories().filter((c) => c.profileId === p.id));

    // Resume: most advanced unfinished story
    let best: { story: MockStory; progress: number } | null = null;
    for (const s of mockStories) {
      const v = Number(localStorage.getItem(`lunireve:progress:${s.slug}`) ?? "0");
      if (v > 10 && v < 90 && (!best || v > best.progress)) {
        best = { story: s, progress: v };
      }
    }
    setResume(best);

    try {
      const favs = JSON.parse(
        localStorage.getItem("lunireve:favorites") ?? "[]"
      ) as string[];
      setFavorites(mockStories.filter((s) => favs.includes(s.slug)));
    } catch {
      /* ignore */
    }
  }, []);

  // No active profile → back to the selector
  useEffect(() => {
    if (profile === null) router.push("/profils");
  }, [profile, router]);

  if (!profile) return null;

  const ageRange = profile.age <= 5 ? "3-5" : profile.age <= 8 ? "6-8" : "9-11";
  const forYou = mockStories
    .filter((s) => s.ageRange === ageRange)
    .sort((a, b) => {
      const aScore = profile.themes.includes(a.theme) ? 1 : 0;
      const bScore = profile.themes.includes(b.theme) ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 6);

  function exit() {
    clearActiveProfile();
    router.push("/profils");
  }

  return (
    <>
      {/* Child top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <FoxMark color={profile.avatar} className="h-10 w-10" />
            <span className="font-serif text-lg tracking-tight">{profile.name}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-fox-300)]/25 px-2.5 py-0.5 text-xs text-[var(--color-fox-700)]">
              <Flame className="h-3 w-3" />
              {profile.streak}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={exit}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-100)] px-3.5 py-1.5 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("exit")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 space-y-14">
        {/* Greeting + create CTA */}
        <section className="flex flex-wrap items-center justify-between gap-6">
          <h1
            className="font-serif text-3xl md:text-5xl tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 70, 'wght' 500" }}
          >
            {t("hello", { name: profile.name })}
          </h1>
          <Link
            href="/creer"
            className="band-ink inline-flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-[var(--color-cream-50)] hover:opacity-95"
          >
            <Wand2 className="h-5 w-5 text-[var(--color-mint-400)]" />
            <span className="text-base font-medium">{t("createStory")}</span>
          </Link>
        </section>

        {/* Resume */}
        {resume && (
          <section>
            <h2 className="sparkle font-serif text-2xl tracking-tight">{t("resume")}</h2>
            <Link
              href={{ pathname: "/histoires/[slug]", params: { slug: resume.story.slug } }}
              className="mt-4 flex items-center gap-5 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow max-w-xl"
            >
              <span aria-hidden className={`${resume.story.cover} h-20 w-16 shrink-0 rounded-xl`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-lg">{resume.story.title}</span>
                <span className="mt-2 block h-2 rounded-full bg-[var(--color-cream-200)]">
                  <span
                    className="block h-2 rounded-full bg-[var(--color-mint-500)]"
                    style={{ width: `${resume.progress}%` }}
                  />
                </span>
                <span className="mt-1.5 block text-xs text-[var(--color-ink-500)]">
                  {t("resumeProgress", { progress: resume.progress })}
                </span>
              </span>
              <BookOpen className="h-5 w-5 shrink-0 text-[var(--color-ink-400)]" />
            </Link>
          </section>
        )}

        {/* Pour toi */}
        <section>
          <h2 className="sparkle font-serif text-2xl tracking-tight">{t("forYou")}</h2>
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {forYou.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </section>

        {/* Favorites */}
        <section>
          <h2 className="sparkle font-serif text-2xl tracking-tight">{t("favorites")}</h2>
          {favorites.length === 0 ? (
            <div className="mt-5 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-10 text-center max-w-xl">
              <Sparkles className="mx-auto h-7 w-7 text-[var(--color-indigo-soft-500)]" />
              <p className="mt-3 text-[var(--color-ink-600)]">{t("favoritesEmpty")}</p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {favorites.map((s) => (
                <StoryCard key={s.slug} story={s} />
              ))}
            </div>
          )}
        </section>

        {/* Personalized stories */}
        <section>
          <h2 className="sparkle font-serif text-2xl tracking-tight">{t("custom")}</h2>
          {custom.length === 0 ? (
            <div className="mt-5 rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-10 text-center max-w-xl">
              <Wand2 className="mx-auto h-7 w-7 text-[var(--color-indigo-soft-500)]" />
              <p className="mt-3 text-[var(--color-ink-600)]">{t("customEmpty")}</p>
              <Link
                href="/creer"
                className="mt-4 inline-block rounded-xl bg-[var(--color-ink-800)] px-4 py-2 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
              >
                {t("createStory")}
              </Link>
            </div>
          ) : (
            <ul className="mt-5 max-w-xl space-y-3">
              {custom.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-4 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-soft)]"
                >
                  <span aria-hidden className="cover-night h-14 w-11 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-lg">{c.title}</span>
                    <span className="block text-xs text-[var(--color-ink-500)]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Full library */}
        <section className="pb-10">
          <Link
            href={{ pathname: "/histoires/age/[range]", params: { range: ageRange } }}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-5 py-3 text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]"
          >
            <BookOpen className="h-5 w-5" />
            {t("library")}
          </Link>
        </section>
      </div>
    </>
  );
}
