// Static + ISR: served from the CDN, revalidated hourly. Keeps crawler and
// prefetch traffic off serverless functions (see Vercel usage incident).
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { seoAlternates } from "@/lib/seo";
import { PromoBanner } from "@/components/marketing/PromoBanner";
import { HeroV2 } from "@/components/marketing/HeroV2";
import { ParallaxBand } from "@/components/marketing/ParallaxBand";
import { GenreCarousel } from "@/components/marketing/GenreCarousel";
import { AgeGrid } from "@/components/marketing/AgeGrid";
import { PersonalizeBand } from "@/components/marketing/PersonalizeBand";
import { ThemeCarousel } from "@/components/marketing/ThemeCarousel";
import { LatestStories } from "@/components/marketing/LatestStories";
import { InteractiveBand } from "@/components/marketing/InteractiveBand";
import { AboutTeaser } from "@/components/marketing/AboutTeaser";

/**
 * Homepage (v2 promoted to default): hero (search + read/personalize CTAs)
 * -> parallax band -> genre cards carousel -> round age cards -> personalized
 * CTA -> themes -> latest -> interactive -> about teaser.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: seoAlternates(locale, "/") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PromoBanner />
      <HeroV2 />
      <ParallaxBand />
      <GenreCarousel />
      <AgeGrid />
      <PersonalizeBand />
      <ThemeCarousel />
      <LatestStories />
      <InteractiveBand />
      <AboutTeaser />
    </>
  );
}
