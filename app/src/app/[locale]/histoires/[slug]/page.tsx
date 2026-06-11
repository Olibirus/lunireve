import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  findStory,
  mockStories,
  storyBody,
  storyQuiz,
  storyGlossary,
  durationBucket,
} from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import { FavoriteButton, ShareButton, ReportDialog } from "@/components/story/StoryActions";
import { RatingStars } from "@/components/story/RatingStars";
import { ReadingProgress } from "@/components/story/ReadingProgress";
import { StoryQuiz } from "@/components/story/StoryQuiz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Headphones,
  Sparkles,
  Star,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Story page — structure follows BRIEF_FINAL.md §5 in order:
 * breadcrumb → hero → chips → summary → downloads → audio → settings →
 * chaptered text → actions → rating → quiz → glossary →
 * personalize CTA → theme links → read next.
 */
export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("story");
  const tAll = await getTranslations();

  const story = findStory(slug);
  if (!story) notFound();

  const body = storyBody(slug);
  const quiz = storyQuiz(slug);
  const glossary = storyGlossary(slug);
  const ageLabel =
    story.ageRange === "3-5" ? "3–5 ans" : story.ageRange === "6-8" ? "6–8 ans" : "9–11 ans";

  // Split the body into 3 chapters — anchors are the audio player's scroll
  // targets and (Phase 2) the chapter boundaries of the generated audio.
  const perChapter = Math.ceil(body.length / 3);
  const chapters = [0, 1, 2]
    .map((i) => body.slice(i * perChapter, (i + 1) * perChapter))
    .filter((c) => c.length > 0);

  const related = mockStories
    .filter((s) => s.slug !== slug && (s.theme === story.theme || s.ageRange === story.ageRange))
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-5xl px-5 md:px-8 pt-6">
        <nav aria-label="Fil d'ariane" className="text-xs text-[var(--color-ink-400)]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[var(--color-ink-700)]">
                {tAll("nav.home")}
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li>
              <Link href="/histoires" className="hover:text-[var(--color-ink-700)]">
                {tAll("funnel.breadcrumbLibrary")}
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li aria-current="page" className="text-[var(--color-ink-600)] truncate max-w-48">
              {story.title}
            </li>
          </ol>
        </nav>
        <Link
          href="/histoires"
          className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToLibrary")}
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 pt-6 md:pt-8">
        <div
          className={cn(
            story.cover,
            "relative rounded-[2rem] overflow-hidden aspect-[16/9] md:aspect-[21/9]"
          )}
        >
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <h1
              className="font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.02] max-w-3xl drop-shadow-sm"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500" }}
            >
              {story.title}
            </h1>
          </div>
        </div>

        {/* Key filter chips (non-clickable, per brief §5) */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge variant="ink">{tAll(`genres.${story.genre}`)}</Badge>
          <Badge variant="indigo">{ageLabel}</Badge>
          <Badge variant="mint">{tAll(`themes.${story.theme}`)}</Badge>
          <Badge variant="default">
            <Clock className="h-3 w-3" />
            {story.readingMinutes} min
          </Badge>
          {story.hasAudio && (
            <Badge variant="default">
              <Headphones className="h-3 w-3" /> Audio
            </Badge>
          )}
          {story.interactive && <Badge variant="fox">{t("interactiveBadge")}</Badge>}
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-500)]">
            <Star className="h-4 w-4 fill-[var(--color-fox-500)] text-[var(--color-fox-500)]" />
            {story.rating.toFixed(1)}
          </span>
        </div>

        {/* Summary */}
        <p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-600)] max-w-3xl">
          {story.excerpt}
        </p>

        {/* Downloads + actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
              {t("downloadPdf")}
            </Button>
            <Button variant="secondary" size="sm">
              <FileText className="h-4 w-4" />
              {t("downloadEpub")}
            </Button>
            <span className="text-xs text-[var(--color-ink-400)]">{t("downloadNote")}</span>
          </div>
          <div className="flex items-center gap-1">
            <FavoriteButton slug={story.slug} />
            <ShareButton />
            <ReportDialog slug={story.slug} />
          </div>
        </div>
      </section>

      {/* Resume banner (everyone — account or not) */}
      <ReadingProgress slug={story.slug} />

      {/* Body + sidebar */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-10 md:py-16">
        <div className="grid lg:grid-cols-[1fr_260px] gap-12 lg:gap-16">
          <article id="story-body" className="prose-reading max-w-[65ch]">
            {chapters.map((paragraphs, ci) => (
              <section key={ci} id={`chapitre-${ci + 1}`}>
                {chapters.length > 1 && (
                  <h2
                    className="font-serif text-xl tracking-tight mt-10 first:mt-0 mb-4 text-[var(--color-indigo-soft-700)]"
                    style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 30" }}
                  >
                    {t("chapterLabel", { number: ci + 1 })}
                  </h2>
                )}
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
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

          {/* Sidebar — listen, reading comfort, print prompt */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-serif text-lg tracking-tight">{t("toolsTitle")}</h3>
              <p className="text-xs text-[var(--color-ink-400)] mt-1">{t("toolsSubtitle")}</p>

              <div className="mt-5 space-y-2">
                <AudioPlayer
                  title={story.title}
                  audioUrl={story.audioUrl}
                  chapterCount={chapters.length}
                />
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--color-ink-100)]">
                <h4 className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
                  {t("readingMode")}
                </h4>
                <div className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
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
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--color-ink-700)]">{t("dyslexiaFont")}</span>
                    <span className="inline-flex rounded-full bg-[var(--color-cream-100)] p-0.5 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-cream-50)] border border-[var(--color-ink-100)] text-[var(--color-ink-500)]">
                        {t("soon")}
                      </span>
                    </span>
                  </div>
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

      {/* Rating + Quiz + Glossary */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 pb-12 space-y-6">
        <RatingStars slug={story.slug} average={story.rating} />
        <StoryQuiz questions={quiz} />

        <details className="group rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 open:pb-4">
          <summary className="cursor-pointer list-none">
            <span className="font-serif text-xl tracking-tight">{t("glossaryTitle")}</span>
            <span className="block mt-1 text-xs text-[var(--color-ink-400)]">
              {t("glossaryHint")}
            </span>
          </summary>
          <dl className="mt-4 space-y-3 border-t border-[var(--color-ink-100)] pt-4">
            {glossary.map((g) => (
              <div key={g.word}>
                <dt className="font-medium text-[var(--color-ink-800)]">{g.word}</dt>
                <dd className="text-sm text-[var(--color-ink-600)]">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </details>

        {/* Personalize CTA */}
        <div className="band-ink relative overflow-hidden rounded-3xl p-7 md:p-9 text-[var(--color-cream-50)]">
          <Sparkles aria-hidden className="absolute right-6 top-6 h-8 w-8 text-[var(--color-mint-400)] opacity-60" />
          <h3 className="font-serif text-2xl tracking-tight max-w-md">
            {t("personalizeTitle")}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-indigo-soft-200)] max-w-md leading-relaxed">
            {t("personalizeBody")}
          </p>
          <Button asChild variant="mint" size="md" className="mt-5">
            <Link href="/creer">{t("personalizeCta")}</Link>
          </Button>
        </div>

        {/* Theme links (clickable, per brief §5) */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("themesLabel")}
          </span>
          <Link
            href={{
              pathname: "/histoires/genre/[genre]",
              params: { genre: story.genre },
            }}
            className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
          >
            {tAll(`genres.${story.genre}`)}
          </Link>
          <Link
            href={{
              pathname: "/histoires/age/[range]",
              params: { range: story.ageRange },
            }}
            className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
          >
            {ageLabel}
          </Link>
          <Link
            href={{
              pathname: "/histoires/duree/[bucket]",
              params: { bucket: durationBucket(story.readingMinutes) },
            }}
            className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
          >
            {tAll(`durations.${durationBucket(story.readingMinutes)}`)}
          </Link>
        </div>
      </section>

      {/* Read next */}
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
