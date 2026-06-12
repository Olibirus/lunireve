import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { blogArticles, findArticle } from "@/data/mock-blog";
import { NewsletterBand } from "@/components/marketing/NewsletterBand";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const article = findArticle(slug);
  if (!article) notFound();

  const date = new Date(article.publishedAt).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <>
      <article className="mx-auto max-w-3xl px-5 md:px-8 pt-8 md:pt-12 pb-16">
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

        <div aria-hidden className={cn(article.cover, "mt-8 aspect-[21/9] rounded-3xl")} />

        <div className="prose-reading mt-10">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mt-12 border-t border-[var(--color-ink-100)] pt-6 text-sm text-[var(--color-ink-500)]">
          {t("authorNote")}
        </p>
      </article>

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
