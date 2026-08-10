// Static + ISR: the funnel shell prerenders per age range; filter refinements
// resolve client-side from the query string (StoryFunnel), so crawler hits on
// ?query variants are CDN cache hits, not function invocations.
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { AGE_RANGES, ageLabel, type AgeRange } from "@/data/mock-stories";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { seoAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; range: string }>;
};

export default async function AgeFunnelPage({ params }: Props) {
  const { locale, range } = await params;
  setRequestLocale(locale);
  if (!AGE_RANGES.includes(range as AgeRange)) notFound();

  const t = await getTranslations();

  return (
      <StoryFunnel
        title={t("funnel.ageTitle", { age: ageLabel(range, locale) })}
        subtitle={t("funnel.ageSubtitle")}
        fixed={{ age: range as AgeRange }}
        pathname="/histoires/age/[range]"
        params={{ range }}
      />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, range } = await params;
  if (!AGE_RANGES.includes(range as AgeRange)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t("funnel.seoAgeTitle", { age: ageLabel(range, locale) }),
    description: t("funnel.seoAgeDescription", { age: ageLabel(range, locale) }),
    alternates: seoAlternates(locale, { pathname: "/histoires/age/[range]", params: { range } }),
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    AGE_RANGES.map((range) => ({ locale, range }))
  );
}
