"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import {
  AGE_RANGES,
  GENRES,
  CHARACTERS,
  ageLabel,
} from "@/data/mock-stories";
import { THEMES } from "@/lib/stories/filter";
import { Search, Wand2 } from "lucide-react";

/**
 * Hero search card (#20) — replaces the mascot on the homepage right side.
 * Four dropdowns (Age / Type / Theme / Character) build a query and open the
 * library filtered; plus a "create a story" suggestion (the USP).
 */
export function HeroSearchCard() {
  const t = useTranslations("heroSearch");
  const locale = useLocale();
  const tAll = useTranslations();
  const router = useRouter();

  const [character, setCharacter] = useState("");
  const [age, setAge] = useState("");
  const [genre, setGenre] = useState("");
  const [theme, setTheme] = useState("");

  function findStories() {
    const query: Record<string, string> = {};
    if (character) query.character = character;
    if (age) query.age = age;
    if (theme) query.theme = theme;
    // Genre routes to its funnel page (SEO), else the library with filters
    if (genre) {
      router.push({ pathname: "/histoires/genre/[genre]", params: { genre }, query } as never);
    } else {
      router.push({ pathname: "/histoires", query } as never);
    }
  }

  const selectClass =
    "w-full rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-400)]/40";

  return (
    <div className="rounded-[2rem] border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 md:p-7 shadow-[var(--shadow-card)]">
      <h2 className="font-serif text-2xl tracking-tight">{t("title")}</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">{t("subtitle")}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("character")}
          </span>
          <select value={character} onChange={(e) => setCharacter(e.target.value)} className={`mt-1.5 ${selectClass}`}>
            <option value="">{t("any")}</option>
            {CHARACTERS.map((c) => (
              <option key={c} value={c}>{tAll(`characters.${c}`)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("age")}
          </span>
          <select value={age} onChange={(e) => setAge(e.target.value)} className={`mt-1.5 ${selectClass}`}>
            <option value="">{t("any")}</option>
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>{ageLabel(a, locale)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("type")}
          </span>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={`mt-1.5 ${selectClass}`}>
            <option value="">{t("any")}</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{tAll(`genres.${g}`)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("theme")}
          </span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className={`mt-1.5 ${selectClass}`}>
            <option value="">{t("any")}</option>
            {THEMES.map((th) => (
              <option key={th} value={th}>{tAll(`themes.${th}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={findStories}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-ink-800)] px-5 py-3 text-sm font-medium text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
      >
        <Search className="h-4 w-4" />
        {t("find")}
      </button>

      <div className="mt-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--color-ink-100)]" />
        <span className="text-xs text-[var(--color-ink-400)]">{t("or")}</span>
        <span className="h-px flex-1 bg-[var(--color-ink-100)]" />
      </div>

      <Link
        href="/creer"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-mint-400)] bg-[var(--color-mint-100)] px-5 py-3 text-sm font-medium text-[var(--color-ink-800)] hover:bg-[var(--color-mint-200)]"
      >
        <Wand2 className="h-4 w-4 text-[var(--color-mint-700)]" />
        {t("create")}
      </Link>
    </div>
  );
}
