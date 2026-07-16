// Static + ISR: the funnel shell prerenders once per locale; filter
// refinements resolve client-side from the query string (StoryFunnel), so
// crawler hits on ?query variants are CDN cache hits, not function invocations.
export const dynamic = "force-static";
export const revalidate = 3600;

import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import type { Metadata } from "next";
import { seoAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AudioFunnelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <Suspense>
      <StoryFunnel
        title={t("funnel.audioTitle")}
        subtitle={t("funnel.audioSubtitle")}
        fixed={{ audio: true }}
        pathname="/histoires/audio"
      />
    </Suspense>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("funnel.seoAudioTitle"),
    description: t("funnel.seoAudioDescription"),
    alternates: seoAlternates(locale, "/histoires/audio"),
  };
}
