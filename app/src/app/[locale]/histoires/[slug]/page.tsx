import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { findStory, mockStories, storyBody } from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookmarkPlus,
  Clock,
  Download,
  Headphones,
  Share2,
  Star,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("story");

  const story = findStory(slug);
  if (!story) notFound();

  const body = storyBody(slug);
  const ageLabel =
    story.ageRange === "3-5" ? "3–5 ans" : story.ageRange === "6-8" ? "6–8 ans" : "9–11 ans";

  const related = mockStories.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Back */}
      <div className="mx-auto max-w-5xl px-5 md:px-8 pt-6">
        <Link
          href="/histoires"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToLibrary")}
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 pt-6 md:pt-10">
        <div
          className={cn(
            story.cover,
            "relative rounded-[2rem] overflow-hidden aspect-[16/9] md:aspect-[21/9]"
          )}
        >
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="ink" className="bg-black/30 text-white border-0 backdrop-blur">
                {ageLabel}
              </Badge>
              <Badge variant="ink" className="bg-black/30 text-white border-0 backdrop-blur">
                {story.readingMinutes} min
              </Badge>
              {story.hasAudio && (
                <Badge variant="ink" className="bg-black/30 text-white border-0 backdrop-blur">
                  <Headphones className="h-3 w-3" /> Audio
                </Badge>
              )}
            </div>
            <h1
              className="font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.02] max-w-3xl drop-shadow-sm"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500" }}
            >
              {story.title}
            </h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-sm text-[var(--color-ink-500)]">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-[var(--color-fox-500)] text-[var(--color-fox-500)]" />
              {story.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {story.readingMinutes} min
            </span>
            <span>·</span>
            <span>{t("narratorLabel")}: <em className="not-italic text-[var(--color-ink-700)]">Lunireve</em></span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <BookmarkPlus className="h-4 w-4" />
              {t("save")}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
              {t("share")}
            </Button>
          </div>
        </div>
      </section>

      {/* Body + Sidebar */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-[1fr_260px] gap-12 lg:gap-16">
          <article className="prose-reading max-w-[65ch]">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <div
              aria-hidden
              className="my-12 flex items-center gap-3 justify-center text-[var(--color-indigo-soft-500)]"
            >
              <span className="h-px w-20 bg-[var(--color-ink-100)]" />
              <span>✦</span>
              <span className="h-px w-20 bg-[var(--color-ink-100)]" />
            </div>

            <p className="not-prose-reading text-center italic text-[var(--color-ink-500)]">
              {t("endNote")}
            </p>
          </article>

          <aside className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-serif text-lg tracking-tight">{t("toolsTitle")}</h3>
              <p className="text-xs text-[var(--color-ink-400)] mt-1">{t("toolsSubtitle")}</p>

              <div className="mt-5 space-y-2">
                <Button variant="primary" size="md" className="w-full justify-start">
                  <Headphones className="h-4 w-4" />
                  {t("listen")}
                </Button>
                <Button variant="secondary" size="md" className="w-full justify-start">
                  <Download className="h-4 w-4" />
                  {t("downloadPdf")}
                </Button>
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--color-ink-100)]">
                <h4 className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
                  {t("readingMode")}
                </h4>
                <div className="mt-3 space-y-2.5 text-sm">
                  <label className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-[var(--color-ink-700)]">
                      <Type className="h-4 w-4" />
                      {t("textSize")}
                    </span>
                    <div className="inline-flex rounded-lg border border-[var(--color-ink-100)] p-0.5 bg-[var(--color-cream-100)]">
                      {["A", "A", "A"].map((x, i) => (
                        <button
                          key={i}
                          type="button"
                          className={cn(
                            "px-2.5 py-1 rounded-md",
                            i === 1 && "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                          )}
                          style={{ fontSize: `${0.75 + i * 0.15}rem` }}
                          aria-label={`${t("textSize")} ${i + 1}`}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                  </label>

                  <label className="flex items-center justify-between gap-4">
                    <span className="text-[var(--color-ink-700)]">{t("dyslexiaFont")}</span>
                    <span className="inline-flex rounded-full bg-[var(--color-cream-100)] p-0.5 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-cream-50)] border border-[var(--color-ink-100)] text-[var(--color-ink-500)]">
                        {t("soon")}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-5">
              <h3 className="font-serif text-lg tracking-tight">{t("printPromptTitle")}</h3>
              <p className="text-sm text-[var(--color-ink-600)] mt-2 leading-relaxed">
                {t("printPromptBody")}
              </p>
              <Button variant="mint" size="sm" className="mt-4 w-full">
                {t("printCta")}
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="bg-[var(--color-cream-100)]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-20">
          <h2
            className="font-serif text-3xl md:text-4xl tracking-tight"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("relatedTitle")}
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {related.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return mockStories.map((s) => ({ slug: s.slug }));
}
