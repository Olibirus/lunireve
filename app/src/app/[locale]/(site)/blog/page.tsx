// Static + ISR: served from the CDN, revalidated hourly. Keeps crawler and
// prefetch traffic off serverless functions (see Vercel usage incident).
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { articlesForLocale } from "@/data/mock-blog";
import { blogImageSrc } from "@/lib/storyImage";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Metadata } from "next";
import { seoAlternates } from "@/lib/seo";

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  // Only articles written in the visitor's language (FR/EN pairs share a
  // baseId in the DB schema; mock data is FR-first).
  const articles = articlesForLocale(locale);

  if (articles.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-5 md:px-8 py-24 text-center">
        <h1 className="font-serif text-3xl tracking-tight">{t("emptyTitle")}</h1>
        <p className="mt-4 text-[var(--color-ink-500)] leading-relaxed">{t("emptyBody")}</p>
      </section>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-[88rem] px-5 md:px-8 pt-12 md:pt-20 pb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("kicker")}
          </p>
          <h1
            className="mt-3 max-w-3xl text-4xl md:text-6xl font-serif leading-[1.04] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
          >
            {t.rich("title", {
              accent: (chunks) => <span className="squiggle">{chunks}</span>,
            })}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-ink-500)] leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
        <div className="dot-rule mx-auto max-w-[88rem]" aria-hidden />
      </section>

      <section className="mx-auto max-w-[88rem] px-5 md:px-8 py-12 md:py-16">
        {/* Featured article */}
        <Link
          href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }}
          className="group grid gap-6 rounded-[2rem] border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 md:grid-cols-[1.1fr_1fr] md:p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
        >
          {blogImageSrc(featured.slug) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blogImageSrc(featured.slug)!} alt="" aria-hidden className="aspect-[16/10] w-full rounded-3xl object-cover" />
          ) : (
            <div aria-hidden className={cn(featured.cover, "aspect-[16/10] rounded-3xl")} />
          )}
          <div className="flex flex-col justify-center py-2 md:pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="mint">{featured.tag}</Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-400)]">
                <Clock className="h-3 w-3" />
                {t("readTime", { minutes: featured.readingMinutes })}
              </span>
            </div>
            <h2
              className="mt-4 font-serif text-2xl md:text-4xl leading-[1.1] tracking-tight group-hover:text-[var(--color-indigo-soft-700)] transition-colors"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {featured.title}
            </h2>
            <p className="mt-3 text-[var(--color-ink-500)] leading-relaxed line-clamp-3">
              {featured.excerpt}
            </p>
          </div>
        </Link>

        {/* Rest */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <Link
              key={a.slug}
              href={{ pathname: "/blog/[slug]", params: { slug: a.slug } }}
              className="group rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              {blogImageSrc(a.slug) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={blogImageSrc(a.slug)!} alt="" aria-hidden className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div aria-hidden className={cn(a.cover, "aspect-[16/9]")} />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="default">{a.tag}</Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-400)]">
                    <Clock className="h-3 w-3" />
                    {t("readTime", { minutes: a.readingMinutes })}
                  </span>
                </div>
                <h2 className="mt-3 font-serif text-xl leading-snug tracking-tight group-hover:text-[var(--color-indigo-soft-700)] transition-colors">
                  {a.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-ink-500)] leading-relaxed line-clamp-2">
                  {a.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("kicker"), description: t("subtitle"), alternates: seoAlternates(locale, "/blog") };
}
