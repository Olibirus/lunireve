import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StoryFunnel } from "@/components/story/StoryFunnel";
import { filtersFromSearchParams } from "@/lib/stories/filter";
import { AGE_RANGES, type AgeRange } from "@/data/mock-stories";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; range: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const AGE_KEY = { "3-5": "3to5", "6-8": "6to8", "9-11": "9to11" } as const;

export default async function AgeFunnelPage({ params, searchParams }: Props) {
  const { locale, range } = await params;
  setRequestLocale(locale);
  if (!AGE_RANGES.includes(range as AgeRange)) notFound();

  const t = await getTranslations();
  const sp = filtersFromSearchParams(await searchParams);

  return (
    <StoryFunnel
      title={t("funnel.ageTitle", {
        age: t(`library.filters.age${AGE_KEY[range as AgeRange]}`),
      })}
      subtitle={t("funnel.ageSubtitle")}
      fixed={{ age: range as AgeRange }}
      query={sp}
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
    title: t("funnel.ageTitle", {
      age: t(`library.filters.age${AGE_KEY[range as AgeRange]}`),
    }),
    description: t("funnel.ageSubtitle"),
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    AGE_RANGES.map((range) => ({ locale, range }))
  );
}
