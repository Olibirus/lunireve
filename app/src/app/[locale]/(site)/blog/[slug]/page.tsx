// Static + ISR: served from the CDN, revalidated hourly. Keeps crawler and
// prefetch traffic off serverless functions (see Vercel usage incident).
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { blogArticles, findArticle, relatedArticles } from "@/data/mock-blog";
import { blogImageSrc } from "@/lib/storyImage";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

/**
 * Article page — long-form layout (feedback #29): TLDR box up top,
 * h2-structured sections, generous reading measure. Built for SEO and
 * social reposting.
 */
export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const article = findArticle(slug);
  if (!article) notFound();

  const related = relatedArticles(slug, 3);

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(
        locale === "fr" ? "fr-FR" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : "";

  return (
    <>
      <article className="mx-auto max-w-5xl px-5 md:px-8 pt-8 md:pt-12 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToBlog")}
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <Badge variant="mint">{article.tag}</Badge>
          <span className="text-xs text-[var(--color-ink-400)]">{date}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-400)]">
            <Clock className="h-3 w-3" />
            {t("readTime", { minutes: article.readingMinutes })}
          </span>
        </div>

        <h1
          className="mt-4 font-serif text-3xl md:text-5xl leading-[1.06] tracking-tight"
          style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
        >
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-600)]">
          {article.excerpt}
        </p>

        {blogImageSrc(article.slug) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blogImageSrc(article.slug)!}
            alt=""
            aria-hidden
            className="mt-8 aspect-[21/9] w-full rounded-3xl object-cover"
          />
        ) : (
          <div aria-hidden className={cn(article.cover, "mt-8 aspect-[21/9] rounded-3xl")} />
        )}

        {/* TLDR box */}
        <aside className="mt-8 rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-6">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--color-mint-800)]">
            <ListChecks className="h-4 w-4" />
            {t("tldr")}
          </p>
          <ul className="mt-3 space-y-2">
            {article.tldr.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-ink-700)]">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-mint-600)]" />
                {point}
              </li>
            ))}
          </ul>
        </aside>

        {/* Sections */}
        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2
                className="font-serif text-2xl md:text-3xl tracking-tight leading-snug"
                style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
              >
                {section.heading}
              </h2>
              <div className="prose-reading mt-4 !text-[1.0625rem]">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="first-letter:!float-none first-letter:!text-[1em] first-letter:!m-0">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-[var(--color-ink-100)] pt-6 text-sm text-[var(--color-ink-500)]">
          {t("authorNote")}
        </p>
      </article>

      {/* Internal linking — 3 related articles, by tag (SEO + engagement) */}
      {related.length > 0 && (
        <section className="bg-[var(--color-cream-100)]">
          <div className="mx-auto max-w-6xl px-5 md:px-8 py-16">
            <h2
              className="font-serif text-2xl md:text-3xl tracking-tight"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("relatedTitle")}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={{ pathname: "/blog/[slug]", params: { slug: a.slug } }}
                  className="group block overflow-hidden rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:border-[var(--color-ink-200)] transition-shadow"
                >
                  {blogImageSrc(a.slug) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={blogImageSrc(a.slug)!} alt="" aria-hidden className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div aria-hidden className={cn(a.cover, "aspect-[16/9] w-full")} />
                  )}
                  <div className="p-5">
                    <Badge variant="mint">{a.tag}</Badge>
                    <h3 className="mt-3 font-serif text-lg leading-snug tracking-tight text-[var(--color-ink-800)]">
                      {a.title}
                    </h3>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-400)]">
                      <Clock className="h-3 w-3" />
                      {t("readTime", { minutes: a.readingMinutes })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterBand />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}
