"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StoryGrid } from "@/components/story/StoryGrid";
import { EmptyResults } from "@/components/story/EmptyResults";
import { StorySearch } from "@/components/story/StorySearch";
import { StoryBreadcrumb } from "@/components/story/StoryBreadcrumb";
import {
  searchStories,
  CHARACTERS,
  AGE_RANGES,
  ageLabel,
} from "@/data/mock-stories";
import {
  applyFilters,
  THEMES,
  CHARACTER_GROUPS,
  THEME_GROUPS,
  groupOf,
  filtersFromSearchParams,
  sortStories,
  sortFromSearchParams,
  SORT_DEFAULT_DIR,
  type StorySortKey,
} from "@/lib/stories/filter";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Library browser — the full filter/sort/results body of /histoires as a
 * client component. The host page prerenders STATIC (one CDN entry per locale;
 * query variants serve the same cached HTML) and filters resolve in the
 * browser from the query string. Chips stay real <Link>s so every drilldown
 * remains a crawlable URL. Extracted from the page during the Vercel usage
 * incident: server-side searchParams forced the route dynamic, billing a
 * function invocation for every crawler hit.
 *
 * UI spec unchanged (feedback round 4 + grouped rails): one horizontal filter
 * section, order Character → Age → Theme, two-level category rails,
 * directional sort.
 */
export function LibraryBrowser() {
  const t = useTranslations("library");
  const tAll = useTranslations();
  const tCats = useTranslations("filterCats");
  const searchParams = useSearchParams();
  const sp: Record<string, string> = Object.fromEntries(searchParams.entries());

  const q = sp.q || undefined;
  const interactiveOnly = sp.interactive === "1";
  const filters = filtersFromSearchParams(sp);
  const sort = sortFromSearchParams(sp);

  let stories = applyFilters(filters);
  if (interactiveOnly) stories = stories.filter((s) => s.interactive);
  if (q) {
    const found = new Set(searchStories(q).map((s) => s.slug));
    stories = stories.filter((s) => found.has(s.slug));
  }
  stories = sortStories(stories, sort);

  // Build a query object preserving other params while toggling one key.
  const baseQuery: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (["character", "age", "theme", "interactive", "sort", "dir", "tag", "ccat", "tcat"].includes(k)) {
      baseQuery[k] = v;
    }
  }
  function chipHref(key: string, value: string | null) {
    const next = { ...baseQuery };
    if (value === null || next[key] === value) delete next[key];
    else next[key] = value;
    return { pathname: "/histoires" as const, query: next };
  }
  /**
   * Category chip: toggles the open group (ccat/tcat). Opening a different
   * group drops a value filter that doesn't belong to it, closing a group
   * keeps the active value filter (its chip row simply folds away).
   */
  function catHref(catKey: "ccat" | "tcat", valueKey: "character" | "theme", id: string, open: boolean) {
    const next = { ...baseQuery };
    if (open) {
      delete next[catKey];
    } else {
      next[catKey] = id;
      const groups = valueKey === "character" ? CHARACTER_GROUPS : THEME_GROUPS;
      const current = next[valueKey];
      if (current && groupOf(groups, current) !== id) delete next[valueKey];
    }
    return { pathname: "/histoires" as const, query: next };
  }
  // Directional sort: first click = natural direction, second click reverses.
  function sortHref(key: StorySortKey) {
    const next = { ...baseQuery };
    if (sort.key === key) {
      next.sort = key;
      next.dir = sort.dir === "desc" ? "asc" : "desc";
    } else {
      next.sort = key;
      delete next.dir; // natural default direction
    }
    if (next.sort === "newest" && (next.dir ?? SORT_DEFAULT_DIR.newest) === "desc") {
      delete next.sort;
      delete next.dir;
    }
    return { pathname: "/histoires" as const, query: next };
  }
  const sortOptions: { value: StorySortKey; label: string }[] = [
    { value: "newest", label: t("sortNewest") },
    { value: "rating", label: t("sortRating") },
    { value: "liked", label: t("sortMostLiked") },
    { value: "duration", label: t("sortDuration") },
  ];

  // Grouped rails (character + theme): category first, sub-chips on demand.
  const openCcat = baseQuery.ccat ?? groupOf(CHARACTER_GROUPS, baseQuery.character);
  const openTcat = baseQuery.tcat ?? groupOf(THEME_GROUPS, baseQuery.theme);
  function clearRailHref(catKey: "ccat" | "tcat", valueKey: "character" | "theme") {
    const next = { ...baseQuery };
    delete next[catKey];
    delete next[valueKey];
    return { pathname: "/histoires" as const, query: next };
  }
  const groupedRails = [
    {
      catKey: "ccat" as const,
      valueKey: "character" as const,
      label: t("filters.characterTitle"),
      groups: CHARACTER_GROUPS.filter((g) => g.members.some((m) => CHARACTERS.includes(m))),
      available: CHARACTERS as readonly string[],
      open: openCcat,
      catLabel: (id: string) => tCats(`characters.${id}`),
      optLabel: (v: string) => tAll(`characters.${v}`),
    },
    {
      catKey: "tcat" as const,
      valueKey: "theme" as const,
      label: t("filters.themeTitle"),
      groups: THEME_GROUPS.filter((g) => g.members.some((m) => THEMES.includes(m))),
      available: THEMES as readonly string[],
      open: openTcat,
      catLabel: (id: string) => tCats(`themes.${id}`),
      optLabel: (v: string) => tAll(`themes.${v}`),
    },
  ];

  const ageRail = {
    key: "age",
    label: t("filters.ageTitle"),
    options: AGE_RANGES.map((a) => ({ value: a, label: ageLabel(a) })),
  } as const;

  const hasFilters =
    Object.keys(baseQuery).some((k) => !["sort", "dir", "ccat", "tcat"].includes(k)) || Boolean(q);

  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-[96rem] px-5 md:px-8 pt-8 md:pt-12 pb-6">
          <StoryBreadcrumb trail={[]} />
          <h1
            className="mt-3 text-4xl md:text-6xl font-serif leading-[1.04] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
          >
            {t.rich("title", { accent: (chunks) => <span className="squiggle">{chunks}</span> })}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-ink-500)] leading-relaxed max-w-2xl">
            {t("subtitle")}
          </p>
          <div className="mt-6 max-w-md">
            <StorySearch />
          </div>
        </div>
        <div className="dot-rule mx-auto max-w-[96rem]" aria-hidden />
      </section>

      {/* Filter rails — Character, Age, Theme; each on its own row.
          Character + Theme are two-level: pick a category, its chips unfold. */}
      <section className="mx-auto max-w-[96rem] px-5 md:px-8 py-6 space-y-4">
        {/* Character (grouped) */}
        <GroupedRail
          rail={groupedRails[0]}
          baseQuery={baseQuery}
          chipHref={chipHref}
          catHref={catHref}
          clearHref={clearRailHref("ccat", "character")}
          allLabel={tAll("funnel.all")}
        />

        {/* Age (flat — few options, stays as-is) */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="shrink-0 text-xs uppercase tracking-widest text-[var(--color-ink-500)] sm:w-24">
            {ageRail.label}
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            <Link
              href={chipHref("age", null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                !baseQuery.age
                  ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                  : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
              )}
            >
              {tAll("funnel.all")}
            </Link>
            {ageRail.options.map((opt) => {
              const selected = baseQuery.age === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={chipHref("age", opt.value)}
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

        {/* Theme (grouped) */}
        <GroupedRail
          rail={groupedRails[1]}
          baseQuery={baseQuery}
          chipHref={chipHref}
          catHref={catHref}
          clearHref={clearRailHref("tcat", "theme")}
          allLabel={tAll("funnel.all")}
        />

        {/* Interactive toggle */}
        <div className="flex justify-center sm:justify-start sm:pl-[6.75rem]">
          <Link
            href={chipHref("interactive", "1")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              interactiveOnly
                ? "bg-[var(--color-fox-500)] text-white border-transparent"
                : "border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/15 text-[var(--color-fox-700)] hover:bg-[var(--color-fox-300)]/30"
            )}
          >
            <Sparkles className="h-3 w-3" />
            {tAll("nav.interactiveStories")}
          </Link>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-[96rem] px-5 md:px-8 pb-16 md:pb-24">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <p className="text-sm text-[var(--color-ink-500)]">
            {q
              ? t("searchResults", { query: q, count: stories.length })
              : t("countLabel", { count: stories.length })}
          </p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            {/* Sort control (#9): each criterion toggles its direction on
                repeat clicks (recent <-> oldest, short <-> long, etc.) */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
                {t("sortLabel")}
              </span>
              {sortOptions.map((opt) => {
                const active = sort.key === opt.value;
                const DirIcon = !active ? ArrowUpDown : sort.dir === "desc" ? ArrowDown : ArrowUp;
                return (
                  <Link
                    key={opt.value}
                    href={sortHref(opt.value)}
                    title={active ? t("sortToggleHint") : undefined}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                        : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {opt.label}
                    <DirIcon className={cn("h-3 w-3", !active && "opacity-50")} />
                  </Link>
                );
              })}
            </div>
            {hasFilters && (
              <Link href="/histoires" className="text-sm text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]">
                {tAll("funnel.clearFilters")}
              </Link>
            )}
          </div>
        </div>

        {stories.length === 0 ? (
          <EmptyResults theme={filters.theme} age={filters.age} character={filters.character} />
        ) : (
          <StoryGrid stories={stories} />
        )}
      </section>
    </>
  );
}

type GroupedRailDef = {
  catKey: "ccat" | "tcat";
  valueKey: "character" | "theme";
  label: string;
  groups: { id: string; members: string[] }[];
  available: readonly string[];
  open: string | undefined;
  catLabel: (id: string) => string;
  optLabel: (v: string) => string;
};

/**
 * Two-level filter rail: category chips first; the open category unfolds its
 * value chips underneath. Open/close is a query param, so every state stays a
 * crawlable URL.
 */
function GroupedRail({
  rail,
  baseQuery,
  chipHref,
  catHref,
  clearHref,
  allLabel,
}: {
  rail: GroupedRailDef;
  baseQuery: Record<string, string>;
  chipHref: (key: string, value: string | null) => { pathname: "/histoires"; query: Record<string, string> };
  catHref: (
    catKey: "ccat" | "tcat",
    valueKey: "character" | "theme",
    id: string,
    open: boolean
  ) => { pathname: "/histoires"; query: Record<string, string> };
  clearHref: { pathname: "/histoires"; query: Record<string, string> };
  allLabel: string;
}) {
  const { catKey, valueKey, label, groups, available, open, catLabel, optLabel } = rail;
  const activeValue = baseQuery[valueKey];
  const openGroup = groups.find((g) => g.id === open);
  const chip = (selected: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs transition-colors",
      selected
        ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
        : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
    );

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-3">
      <span className="shrink-0 text-xs uppercase tracking-widest text-[var(--color-ink-500)] sm:w-24 sm:pt-1">
        {label}
      </span>
      <div className="flex flex-col items-center gap-2 sm:items-start">
        {/* Category row */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
          <Link href={clearHref} className={chip(!activeValue && !openGroup)}>
            {allLabel}
          </Link>
          {groups.map((g) => {
            const isOpen = open === g.id;
            const holdsActive = Boolean(activeValue && g.members.includes(activeValue));
            return (
              <Link
                key={g.id}
                href={catHref(catKey, valueKey, g.id, isOpen)}
                aria-expanded={isOpen}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
                  isOpen || holdsActive
                    ? "bg-[var(--color-indigo-soft-100)] border-[var(--color-indigo-soft-300)] font-medium text-[#232f5c]"
                    : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {catLabel(g.id)}
                <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
              </Link>
            );
          })}
        </div>

        {/* Sub-chips of the open category */}
        {openGroup && (
          <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--color-indigo-soft-300)]/60 bg-[var(--color-cream-100)]/70 px-3 py-2 sm:justify-start">
            {openGroup.members
              .filter((m) => available.includes(m))
              .map((m) => (
                <Link key={m} href={chipHref(valueKey, m)} className={chip(activeValue === m)}>
                  {optLabel(m)}
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
