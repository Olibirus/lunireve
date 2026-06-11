import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { filtersFromSearchParams } from "@/lib/stories/filter";
import { GENRES, type Genre } from "@/data/mock-stories";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; genre: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GenreFunnelPage({ params, searchParams }: Props) {
  const { locale, genre } = await params;
  setRequestLocale(locale);
  if (!GENRES.includes(genre as Genre)) notFound();

  const t = await getTranslations();
  const sp = filtersFromSearchParams(await searchParams);

  return (
    <StoryFunnel
      title={t(`genres.${genre}`)}
      subtitle={t("funnel.genreSubtitle")}
      fixed={{ genre: genre as Genre }}
      query={sp}
      pathname="/histoires/genre/[genre]"
      params={{ genre }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, genre } = await params;
  if (!GENRES.includes(genre as Genre)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t(`genres.${genre}`),
    description: t("funnel.genreSubtitle"),
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    GENRES.map((genre) => ({ locale, genre }))
  );
}
