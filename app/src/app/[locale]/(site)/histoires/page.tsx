import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StoryFilters } from "@/components/story/StoryFilters";
import { StoryCard } from "@/components/story/StoryCard";
import { StorySearch } from "@/components/story/StorySearch";
import { mockStories, GENRES, AGE_RANGES } from "@/data/mock-stories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Headphones } from "lucide-react";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("library");
  const tAll = await getTranslations();

  return (
    <>
      {/* Page header */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
              {t("kicker")}
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-serif leading-[1.04] tracking-tight"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
            >
              {t.rich("title", {
                accent: (chunks) => <span className="squiggle">{chunks}</span>,
              })}
            </h1>
            <p className="mt-5 text-lg text-[var(--color-ink-500)] leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="mint">{t("pill1")}</Badge>
              <Badge variant="indigo">{t("pill2")}</Badge>
              <Badge variant="default">{t("pill3")}</Badge>
            </div>

            <div className="mt-7 max-w-md">
              <StorySearch />
            </div>

            {/* Funnel entry points — SEO landing pages by axis */}
            <div className="mt-6 flex flex-wrap items-center gap-1.5 text-xs">
              {AGE_RANGES.map((range) => (
                <Link
                  key={range}
                  href={{ pathname: "/histoires/age/[range]", params: { range } }}
                  className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
                >
                  {range} ans
                </Link>
              ))}
              <span aria-hidden className="mx-1 text-[var(--color-ink-200)]">|</span>
              {GENRES.slice(0, 5).map((genre) => (
                <Link
                  key={genre}
                  href={{ pathname: "/histoires/genre/[genre]", params: { genre } }}
                  className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
                >
                  {tAll(`genres.${genre}`)}
                </Link>
              ))}
              <span aria-hidden className="mx-1 text-[var(--color-ink-200)]">|</span>
              <Link
                href="/histoires/audio"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] px-3 py-1 text-[var(--color-ink-700)] hover:bg-[var(--color-mint-200)] transition-colors"
              >
                <Headphones className="h-3 w-3" />
                {tAll("funnel.audioTitle")}
              </Link>
            </div>
          </div>
        </div>
        <div className="dot-rule mx-auto max-w-7xl" aria-hidden />
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-16">
        <div className="grid lg:grid-cols-[240px_1fr] gap-12 lg:gap-16">
          <StoryFilters />

          <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-sm text-[var(--color-ink-500)]">
                {t("countLabel", { count: mockStories.length })}
              </p>
              <div className="inline-flex items-center gap-2 text-sm">
                <label htmlFor="sort" className="text-[var(--color-ink-500)]">
                  {t("sortLabel")}
                </label>
                <select
                  id="sort"
                  className="rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-400)]/40"
                >
                  <option>{t("sortNewest")}</option>
                  <option>{t("sortRating")}</option>
                  <option>{t("sortShortest")}</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-7">
              {mockStories.map((s) => (
                <StoryCard key={s.slug} story={s} />
              ))}
            </div>

            {/* Pagination */}
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-between border-t border-[var(--color-ink-100)] pt-6"
            >
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                {t("prev")}
              </Button>
              <p className="text-sm text-[var(--color-ink-500)]">
                {t("pageOf", { current: 1, total: 1 })}
              </p>
              <Button variant="outline" size="sm" disabled>
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
