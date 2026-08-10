// Static + ISR: the funnel shell prerenders per duration bucket; filter
// refinements resolve client-side from the query string (StoryFunnel), so
// crawler hits on ?query variants are CDN cache hits, not function invocations.
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { DURATION_BUCKETS, type DurationBucket } from "@/data/mock-stories";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { seoAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; bucket: string }>;
};

export default async function DurationFunnelPage({ params }: Props) {
  const { locale, bucket } = await params;
  setRequestLocale(locale);
  if (!DURATION_BUCKETS.includes(bucket as DurationBucket)) notFound();

  const t = await getTranslations();

  return (
      <StoryFunnel
        title={t(`durations.${bucket}`)}
        subtitle={t("funnel.durationSubtitle")}
        fixed={{ duration: bucket as DurationBucket }}
        pathname="/histoires/duree/[bucket]"
        params={{ bucket }}
      />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, bucket } = await params;
  if (!DURATION_BUCKETS.includes(bucket as DurationBucket)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t(`durations.${bucket}`),
    description: t("funnel.durationSubtitle"),
    alternates: seoAlternates(locale, { pathname: "/histoires/duree/[bucket]", params: { bucket } }),
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    DURATION_BUCKETS.map((bucket) => ({ locale, bucket }))
  );
}
