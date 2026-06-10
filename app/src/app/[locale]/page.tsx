import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/marketing/Hero";
import { ThreeWays } from "@/components/marketing/ThreeWays";
import { FeaturedStories } from "@/components/marketing/FeaturedStories";
import { Testimonial } from "@/components/marketing/Testimonial";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";

/**
 * Homepage. Pure composition — each section is a standalone component so we can
 * A/B test order or swap sections without touching the shell.
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
      <Hero />
      <div className="dot-rule mx-auto max-w-5xl" aria-hidden />
      <ThreeWays />
      <FeaturedStories />
      <Testimonial />
      <NewsletterBand />
    </>
  );
}
