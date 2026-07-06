import { setRequestLocale } from "next-intl/server";
import { PromoBanner } from "@/components/marketing/PromoBanner";
import { HeroV2 } from "@/components/marketing/HeroV2";
import { ParallaxBand } from "@/components/marketing/ParallaxBand";
import { GenreCarousel } from "@/components/marketing/GenreCarousel";
import { AgeGrid } from "@/components/marketing/AgeGrid";
import { PersonalizeBand } from "@/components/marketing/PersonalizeBand";
import { AboutTeaser } from "@/components/marketing/AboutTeaser";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";

/**
 * Homepage (v2 promoted to default): hero (search + read/personalize CTAs)
 * -> parallax band -> genre cards carousel -> round age cards -> personalized
 * CTA -> about teaser -> newsletter.
 */
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
      <AboutTeaser />
      <NewsletterBand />
    </>
  );
}
