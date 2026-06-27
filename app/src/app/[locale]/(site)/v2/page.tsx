import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { HeroV2 } from "@/components/marketing/HeroV2";
import { ParallaxBand } from "@/components/marketing/ParallaxBand";
import { StoryRow } from "@/components/marketing/StoryRow";
import { PersonalizeBand } from "@/components/marketing/PersonalizeBand";
import { AboutTeaser } from "@/components/marketing/AboutTeaser";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";
import { mockStories, GENRES, AGE_RANGES, ageLabel } from "@/data/mock-stories";

/**
 * Homepage v2 (test page at /v2) — alternative structure to compare against the
 * live homepage: hero (search + personalize) -> parallax -> stories by genre
 * -> stories by age -> personalize CTA -> about teaser -> newsletter.
 */
export default async function HomeV2Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("homeV2");
  const tAll = await getTranslations();

  const ageOrder = (r: string) => AGE_RANGES.indexOf(r as (typeof AGE_RANGES)[number]);
  const byAge = [...mockStories].sort((a, b) => ageOrder(a.ageRange) - ageOrder(b.ageRange));

  const genreChips = GENRES.map((g) => ({
    label: tAll(`genres.${g}`),
    href: { pathname: "/histoires/genre/[genre]" as const, params: { genre: g } },
  }));
  const ageChips = AGE_RANGES.map((r) => ({
    label: ageLabel(r),
    href: { pathname: "/histoires/age/[range]" as const, params: { range: r } },
  }));

  return (
    <>
      <HeroV2 />
      <ParallaxBand />
      <StoryRow
        title={t("byGenreTitle")}
        subtitle={t("byGenreSubtitle")}
        stories={mockStories}
        chips={genreChips}
        seeAllHref="/histoires"
        seeAllLabel={tAll("home.featured.seeAll")}
        starOffset={0}
      />
      <StoryRow
        title={t("byAgeTitle")}
        subtitle={t("byAgeSubtitle")}
        stories={byAge}
        chips={ageChips}
        seeAllHref="/histoires"
        seeAllLabel={tAll("home.featured.seeAll")}
        starOffset={4}
      />
      <PersonalizeBand />
      <AboutTeaser />
      <NewsletterBand />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homeV2" });
  return { title: t("metaTitle"), description: t("byGenreSubtitle") };
}
