import { setRequestLocale, getTranslations } from "next-intl/server";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { filtersFromSearchParams } from "@/lib/stories/filter";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AudioFunnelPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const sp = filtersFromSearchParams(await searchParams);

  return (
    <StoryFunnel
      title={t("funnel.audioTitle")}
      subtitle={t("funnel.audioSubtitle")}
      fixed={{ audio: true }}
      query={sp}
      pathname="/histoires/audio"
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("funnel.audioTitle"),
    description: t("funnel.audioSubtitle"),
  };
}
