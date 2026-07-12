"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StoryCard } from "@/components/story/StoryCard";
import { EmptyResults } from "@/components/story/EmptyResults";
import { StorySearch } from "@/components/story/StorySearch";
import { StoryBreadcrumb } from "@/components/story/StoryBreadcrumb";
import {
  applyFilters,
  filtersFromSearchParams,
  THEMES,
  type StoryFilters,
} from "@/lib/stories/filter";
import {
  GENRES,
  AGE_RANGES,
  DURATION_BUCKETS,
  CHARACTERS,
  ageLabel,
} from "@/data/mock-stories";
import { cn } from "@/lib/utils/cn";

/**
 * Shared funnel page body. One axis is FIXED by the route (e.g. /genre/conte
 * pins genre); the remaining axes render as link-chip rails that refine via
 * query string. Links (not client state) keep every drilldown crawlable —
 * these pages are the SEO engine.
 *
 * Client component reading useSearchParams: the host pages prerender STATIC
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
  const searchParams = useSearchParams();
  const query = filtersFromSearchParams(
    Object.fromEntries(searchParams.entries())
  );
  const active: StoryFilters = { ...query, ...fixed };
  const stories = applyFilters(active);

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
      options: AGE_RANGES.map((a) => ({ value: a, label: ageLabel(a) })),
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

      {/* Refinement rails */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-8 space-y-5">
        {rails.map((rail) => (
          <div key={rail.key} className="flex flex-wrap items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] w-28 shrink-0">
              {rail.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={href(chipQuery(rail.key, null))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  query[rail.key] === undefined
                    ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                    : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {t("funnel.all")}
              </Link>
              {rail.options.map((opt) => {
                const selected = String(query[rail.key]) === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={href(chipQuery(rail.key, selected ? null : opt.value))}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      selected
                        ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                        : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
            {stories.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
