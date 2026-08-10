// Static + ISR: the funnel shell prerenders per genre; filter refinements
// resolve client-side from the query string (StoryFunnel), so crawler hits on
// ?query variants are CDN cache hits, not function invocations.
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { GENRES, type Genre } from "@/data/mock-stories";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { seoAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; genre: string }>;
};

export default async function GenreFunnelPage({ params }: Props) {
  const { locale, genre } = await params;
  setRequestLocale(locale);
  if (!GENRES.includes(genre as Genre)) notFound();

  const t = await getTranslations();

  return (
      <StoryFunnel
        title={t(`genres.${genre}`)}
        subtitle={t("funnel.genreSubtitle")}
        fixed={{ genre: genre as Genre }}
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
    title: t("funnel.seoGenreTitle", { genre: t(`genres.${genre}`) }),
    description: t("funnel.genreSubtitle"),
    alternates: seoAlternates(locale, { pathname: "/histoires/genre/[genre]", params: { genre } }),
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    GENRES.map((genre) => ({ locale, genre }))
  );
}
