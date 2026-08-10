// Static + ISR: the library shell prerenders per locale; filtering/sorting
// resolves client-side from the query string (LibraryBrowser), so crawler
// hits on ?query variants are CDN cache hits, not function invocations.
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/story/LibraryBrowser";
import { seoAlternates } from "@/lib/seo";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <LibraryBrowser />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "library" });
  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
    alternates: seoAlternates(locale, "/histoires"),
  };
}
