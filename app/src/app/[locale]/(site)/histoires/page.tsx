import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StoryCard } from "@/components/story/StoryCard";
import { StorySearch } from "@/components/story/StorySearch";
import { StoryBreadcrumb } from "@/components/story/StoryBreadcrumb";
import {
  mockStories,
  searchStories,
  CHARACTERS,
  AGE_RANGES,
  ageLabel,
} from "@/data/mock-stories";
import {
  applyFilters,
  THEMES,
  filtersFromSearchParams,
  sortStories,
  sortFromSearchParams,
} from "@/lib/stories/filter";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Library — single coherent filter UI (feedback round 4): one horizontal
 * filter section (no redundant sidebar, #15), order Character → Age → Theme
 * (#16), no audio filter since every story has audio (#17), each rail on its
 * own centered row on mobile (#14), breadcrumb at top (#33). Server-rendered
 * with crawlable Link chips that toggle query params.
 */
export default async function LibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("library");
  const tAll = await getTranslations();

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
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
    if (typeof v === "string" && ["character", "age", "theme", "interactive", "sort"].includes(k)) {
      baseQuery[k] = v;
    }
  }
  function chipHref(key: string, value: string | null) {
    const next = { ...baseQuery };
    if (value === null || next[key] === value) delete next[key];
    else next[key] = value;
    return { pathname: "/histoires" as const, query: next };
  }
  // Sort links keep active filters but swap the sort key (default omits it).
  function sortHref(value: string) {
    const next = { ...baseQuery };
    if (value === "newest") delete next.sort;
    else next.sort = value;
    return { pathname: "/histoires" as const, query: next };
  }
  const sortOptions = [
    { value: "newest", label: t("sortNewest") },
    { value: "rating", label: t("sortRating") },
    { value: "liked", label: t("sortMostLiked") },
    { value: "shortest", label: t("sortShortest") },
  ] as const;

  const rails = [
    {
      key: "character",
      label: t("filters.characterTitle"),
      options: CHARACTERS.map((c) => ({ value: c, label: tAll(`characters.${c}`) })),
    },
    {
      key: "age",
      label: t("filters.ageTitle"),
      options: AGE_RANGES.map((a) => ({ value: a, label: ageLabel(a) })),
    },
    {
      key: "theme",
      label: t("filters.themeTitle"),
      options: THEMES.map((th) => ({ value: th, label: tAll(`themes.${th}`) })),
    },
  ] as const;

  const hasFilters =
    Object.keys(baseQuery).some((k) => k !== "sort") || Boolean(q);

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

      {/* Filter rails — Character, Age, Theme; each on its own row */}
      <section className="mx-auto max-w-[96rem] px-5 md:px-8 py-6 space-y-4">
        {rails.map((rail) => (
          <div
            key={rail.key}
            className="flex flex-col items-center gap-2 sm:flex-row sm:items-baseline sm:gap-3"
          >
            <span className="shrink-0 text-xs uppercase tracking-widest text-[var(--color-ink-500)] sm:w-24">
              {rail.label}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
              <Link
                href={chipHref(rail.key, null)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  !baseQuery[rail.key]
                    ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                    : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {tAll("funnel.all")}
              </Link>
              {rail.options.map((opt) => {
                const selected = baseQuery[rail.key] === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={chipHref(rail.key, opt.value)}
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
            {/* Sort control (#9): best rating, most liked, etc. */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
                {t("sortLabel")}
              </span>
              {sortOptions.map((opt) => {
                const active = sort === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={sortHref(opt.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)] border-transparent"
                        : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {opt.label}
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
          <div className="rounded-3xl border-2 border-dashed border-[var(--color-ink-200)] bg-[var(--color-cream-100)] p-12 text-center">
            <p className="font-serif text-xl">{tAll("funnel.emptyTitle")}</p>
            <p className="mt-2 text-sm text-[var(--color-ink-500)]">{tAll("funnel.emptyBody")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {stories.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
