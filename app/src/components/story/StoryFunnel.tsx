"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUrlQuery } from "@/lib/useUrlQuery";
import { Link } from "@/i18n/navigation";
import { StoryGrid } from "@/components/story/StoryGrid";
import { EmptyResults } from "@/components/story/EmptyResults";
import { StorySearch } from "@/components/story/StorySearch";
import { StoryBreadcrumb } from "@/components/story/StoryBreadcrumb";
import {
  applyFilters,
  filtersFromSearchParams,
  THEMES,
  CHARACTER_GROUPS,
  THEME_GROUPS,
  groupOf,
  type StoryFilters,
} from "@/lib/stories/filter";
import {
  GENRES,
  AGE_RANGES,
  DURATION_BUCKETS,
  CHARACTERS,
  ageLabel,
} from "@/data/mock-stories";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared funnel page body. One axis is FIXED by the route (e.g. /genre/conte
 * pins genre); the remaining axes render as link-chip rails that refine via
 * query string. Links (not client state) keep every drilldown crawlable —
 * these pages are the SEO engine.
 *
 * Client component reading the URL query (useUrlQuery, not useSearchParams,
 * which would disable prerendering): the host pages prerender STATIC
 * (one CDN-cached entry per route, query variants included — Vercel ignores
 * the query string for static routes), and refinements resolve in the browser.
 * This is what turned crawler traffic on these routes from a function
 * invocation per hit into a free cache hit (see the usage incident).
 */

type AnyPathname =
  | "/histoires/genre/[genre]"
  | "/histoires/age/[range]"
  | "/histoires/audio"
  | "/histoires/duree/[bucket]";

export function StoryFunnel({
  title,
  subtitle,
  fixed,
  pathname,
  params,
}: {
  title: string;
  subtitle: string;
  fixed: StoryFilters;
  pathname: AnyPathname;
  params?: Record<string, string>;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const query = filtersFromSearchParams(useUrlQuery());
  const active: StoryFilters = { ...query, ...fixed };
  const stories = applyFilters(active);

  // Two-level rails (same UX as the main library): character and theme chips
  // are grouped into categories; the open category unfolds its sub-chips.
  // Client-side open state here (instant), value chips stay crawlable links.
  const [openCharCat, setOpenCharCat] = useState<string | null>(null);
  const [openThemeCat, setOpenThemeCat] = useState<string | null>(null);
  const effOpenCharCat = openCharCat ?? groupOf(CHARACTER_GROUPS, query.character) ?? null;
  const effOpenThemeCat = openThemeCat ?? groupOf(THEME_GROUPS, query.theme) ?? null;

  // Rails to render: every axis not pinned by the route.
  const rails: {
    key: keyof StoryFilters;
    label: string;
    options: { value: string; label: string }[];
  }[] = [];

  if (!fixed.age)
    rails.push({
      key: "age",
      label: t("funnel.refineAge"),
      options: AGE_RANGES.map((a) => ({ value: a, label: ageLabel(a, locale) })),
    });
  if (!fixed.genre)
    rails.push({
      key: "genre",
      label: t("funnel.refineGenre"),
      options: GENRES.map((g) => ({ value: g, label: t(`genres.${g}`) })),
    });
  if (!fixed.theme)
    rails.push({
      key: "theme",
      label: t("funnel.refineTheme"),
      options: THEMES.map((th) => ({ value: th, label: t(`themes.${th}`) })),
    });
  if (!fixed.character)
    rails.push({
      key: "character",
      label: t("funnel.refineCharacter"),
      options: CHARACTERS.map((c) => ({ value: c, label: t(`characters.${c}`) })),
    });
  if (!fixed.duration && !fixed.audio)
    rails.push({
      key: "duration",
      label: t("funnel.refineDuration"),
      options: DURATION_BUCKETS.map((d) => ({
        value: d,
        label: t(`durations.${d}`),
      })),
    });

  /** Build the query object for a chip: toggle `key=value`, keep the rest. */
  function chipQuery(key: keyof StoryFilters, value: string | null) {
    const q: Record<string, string> = {};
    for (const rail of rails) {
      const current = query[rail.key];
      if (rail.key === key) {
        if (value !== null) q[rail.key] = value;
      } else if (current !== undefined) {
        q[rail.key] = String(current);
      }
    }
    return q;
  }

  const href = (q: Record<string, string>) =>
    params
      ? ({ pathname, params, query: q } as never)
      : ({ pathname, query: q } as never);

  const hasRefinements = rails.some((r) => query[r.key] !== undefined);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-16 pb-8">
          <StoryBreadcrumb trail={[{ label: title }]} />

          <h1
            className="mt-4 text-4xl md:text-6xl font-serif leading-[1.04] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
          >
            {title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-ink-500)] leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          <div className="mt-6 max-w-md">
            <StorySearch />
          </div>
        </div>
        <div className="dot-rule mx-auto max-w-7xl" aria-hidden />
      </section>

      {/* Refinement rails — character and theme are two-level (categories
          first, sub-chips unfold), the small axes stay flat. */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-8 space-y-5">
        {rails.map((rail) => {
          const chipCls = (selected: boolean) =>
            cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              selected
                ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
            );

          const grouped =
            rail.key === "character"
              ? {
                  groups: CHARACTER_GROUPS,
                  open: effOpenCharCat,
                  setOpen: setOpenCharCat,
                  catLabel: (id: string) => t(`filterCats.characters.${id}`),
                  available: CHARACTERS as readonly string[],
                }
              : rail.key === "theme"
              ? {
                  groups: THEME_GROUPS,
                  open: effOpenThemeCat,
                  setOpen: setOpenThemeCat,
                  catLabel: (id: string) => t(`filterCats.themes.${id}`),
                  available: THEMES as readonly string[],
                }
              : null;

          if (grouped) {
            const openGroup = grouped.groups.find((g) => g.id === grouped.open);
            return (
              <div key={rail.key} className="flex flex-wrap items-start gap-2">
                <span className="w-28 shrink-0 pt-1 text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
                  {rail.label}
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href={href(chipQuery(rail.key, null))}
                      onClick={() => grouped.setOpen(null)}
                      className={chipCls(query[rail.key] === undefined && !openGroup)}
                    >
                      {t("funnel.all")}
                    </Link>
                    {grouped.groups
                      .filter((g) => g.members.some((m) => grouped.available.includes(m)))
                      .map((g) => {
                        const isOpen = grouped.open === g.id;
                        const holdsActive = Boolean(
                          query[rail.key] && g.members.includes(String(query[rail.key]))
                        );
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => grouped.setOpen(isOpen ? null : g.id)}
                            aria-expanded={isOpen}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
                              isOpen || holdsActive
                                ? "border-[var(--color-indigo-soft-300)] bg-[var(--color-indigo-soft-100)] font-medium text-[var(--color-catpill-fg)]"
                                : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                            )}
                          >
                            {grouped.catLabel(g.id)}
                            <ChevronDown
                              className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
                            />
                          </button>
                        );
                      })}
                  </div>
                  {openGroup && (
                    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-dashed border-[var(--color-indigo-soft-300)]/60 bg-[var(--color-cream-100)]/70 px-3 py-2">
                      {openGroup.members
                        .filter((m) => grouped.available.includes(m))
                        .map((m) => {
                          const selected = String(query[rail.key]) === m;
                          return (
                            <Link
                              key={m}
                              href={href(chipQuery(rail.key, selected ? null : m))}
                              className={chipCls(selected)}
                            >
                              {rail.key === "character" ? t(`characters.${m}`) : t(`themes.${m}`)}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={rail.key} className="flex flex-wrap items-baseline gap-2">
              <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] w-28 shrink-0">
                {rail.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Link href={href(chipQuery(rail.key, null))} className={chipCls(query[rail.key] === undefined)}>
                  {t("funnel.all")}
                </Link>
                {rail.options.map((opt) => {
                  const selected = String(query[rail.key]) === opt.value;
                  return (
                    <Link
                      key={opt.value}
                      href={href(chipQuery(rail.key, selected ? null : opt.value))}
                      className={chipCls(selected)}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-16 md:pb-24">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--color-ink-500)]">
            {t("library.countLabel", { count: stories.length })}
          </p>
          {hasRefinements && (
            <Link
              href={href({})}
              className="text-sm text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]"
            >
              {t("funnel.clearFilters")}
            </Link>
          )}
        </div>

        {stories.length === 0 ? (
          <EmptyResults theme={active.theme} age={active.age} character={active.character} />
        ) : (
          <StoryGrid stories={stories} />
        )}
      </section>
    </>
  );
}
