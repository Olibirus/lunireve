import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { filtersFromSearchParams } from "@/lib/stories/filter";
import { DURATION_BUCKETS, type DurationBucket } from "@/data/mock-stories";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; bucket: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DurationFunnelPage({ params, searchParams }: Props) {
  const { locale, bucket } = await params;
  setRequestLocale(locale);
  if (!DURATION_BUCKETS.includes(bucket as DurationBucket)) notFound();

  const t = await getTranslations();
  const sp = filtersFromSearchParams(await searchParams);

  return (
    <StoryFunnel
      title={t(`durations.${bucket}`)}
      subtitle={t("funnel.durationSubtitle")}
      fixed={{ duration: bucket as DurationBucket }}
      query={sp}
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
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    DURATION_BUCKETS.map((bucket) => ({ locale, bucket }))
  );
}
