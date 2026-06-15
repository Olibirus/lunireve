import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  findStory,
  mockStories,
  storyBody,
  storyQuiz,
  storyGlossary,
  interactiveTree,
  interactiveQuiz,
  interactiveGlossary,
  durationBucket,
  ageLabel,
  type GlossaryEntry,
} from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { storyImageSrc } from "@/lib/storyImage";
import { StoryBreadcrumb } from "@/components/story/StoryBreadcrumb";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import { DownloadButtons } from "@/components/story/DownloadButtons";
import { FavoriteButton, ShareButton, ReportDialog } from "@/components/story/StoryActions";
import { RatingStars } from "@/components/story/RatingStars";
import { ReadingProgress } from "@/components/story/ReadingProgress";
import { ReadingSettings } from "@/components/story/ReadingSettings";
import { StoryQuiz } from "@/components/story/StoryQuiz";
import { InteractiveStory } from "@/components/story/InteractiveStory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Headphones, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Story page V2 — feedback round 1:
 * full-viewport parallax hero (#1), progress line under navbar (#6),
 * clickable chips and tags (#10), inline dotted glossary terms (#11),
 * actions next to rating at the end (#12), interactive branching (#14),
 * centered single-column reading layout (#19), working text size +
 * dyslexia (#20), real ratings with login gate (#3/#22), open glossary (#30).
 */

/** Wrap the first occurrence of each glossary word in a tooltip span. */
function withGlossary(text: string, glossary: GlossaryEntry[]): ReactNode[] {
  let parts: ReactNode[] = [text];
  for (const entry of glossary) {
    const next: ReactNode[] = [];
    let wrapped = false;
    for (const part of parts) {
      if (typeof part !== "string" || wrapped) {
        next.push(part);
        continue;
      }
      const idx = part.toLowerCase().indexOf(entry.word.toLowerCase());
      if (idx === -1) {
        next.push(part);
        continue;
      }
      wrapped = true;
      next.push(part.slice(0, idx));
      next.push(
        <span key={`${entry.word}-${idx}`} className="glossary-term" tabIndex={0}>
          {part.slice(idx, idx + entry.word.length)}
          {/* Definition lives in the DOM (not a CSS attr) so it always renders,
              for every story, present and future. */}
          <span className="glossary-tip" role="tooltip">
            {entry.definition}
          </span>
        </span>
      );
      next.push(part.slice(idx + entry.word.length));
    }
    parts = next;
  }
  return parts;
}

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
  // Interactive stories carry their own branching tree, quiz and glossary so
  // the quiz matches the story the reader actually plays (not the fallback).
  const interactive = story.interactive ? interactiveTree(slug) : undefined;
  const quiz = story.interactive ? interactiveQuiz() : storyQuiz(slug);
  const glossary = story.interactive ? interactiveGlossary() : storyGlossary(slug);
  const age = ageLabel(story.ageRange);
  const bucket = durationBucket(story.readingMinutes);
  const heroImg = storyImageSrc(slug);

  const related = mockStories
    .filter((s) => s.slug !== slug && (s.theme === story.theme || s.ageRange === story.ageRange))
    .slice(0, 3);

  const chipClass =
    "rounded-full border border-white/30 bg-black/25 px-3 py-1 text-xs text-white backdrop-blur-sm hover:bg-black/40 transition-colors";

  return (
    <>
      {/* Full-viewport parallax hero (#1) — bg-fixed keeps the cover still
          while the page scrolls over it. Image slot: the real illustration
          becomes a fixed-attachment background at /illustrations/story-<slug>.png */}
      <section
        className={cn(story.cover, "relative h-[72svh] md:h-[88svh] bg-fixed bg-cover bg-center bg-no-repeat")}
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {/* Breadcrumb sits ON the illustration (#33), styled like the old
            back-to-library button which it replaces. */}
        <div className="absolute left-0 right-0 top-4 mx-auto max-w-5xl px-5 md:px-8">
          <StoryBreadcrumb
            onImage
            trail={[
              { label: tAll(`genres.${story.genre}`), href: { pathname: "/histoires/genre/[genre]", params: { genre: story.genre } } },
              { label: story.title },
            ]}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-5 md:px-8 pb-10 md:pb-16">
          {/* Clickable filter chips (#10) */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={{ pathname: "/histoires/genre/[genre]", params: { genre: story.genre } }}
              className={chipClass}
            >
              {tAll(`genres.${story.genre}`)}
            </Link>
            <Link
              href={{ pathname: "/histoires/age/[range]", params: { range: story.ageRange } }}
              className={chipClass}
            >
              {age}
            </Link>
            <Link
              href={{
                pathname: "/histoires/genre/[genre]",
                params: { genre: story.genre },
                query: { theme: story.theme },
              }}
              className={chipClass}
            >
              {tAll(`themes.${story.theme}`)}
            </Link>
            <Link
              href={{ pathname: "/histoires/duree/[bucket]", params: { bucket } }}
              className={chipClass}
            >
              <Clock className="mr-1 inline h-3 w-3" />
              {story.readingMinutes} min
            </Link>
            {story.hasAudio && (
              <Link href="/histoires/audio" className={chipClass}>
                <Headphones className="mr-1 inline h-3 w-3" /> Audio
              </Link>
            )}
            {story.interactive && (
              <Badge variant="fox" className="border-0">{t("interactiveBadge")}</Badge>
            )}
          </div>
          <h1
            className="mt-4 font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.02] max-w-3xl drop-shadow-sm"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500" }}
          >
            {story.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed">
            {story.excerpt}
          </p>
        </div>
      </section>

      {/* Progress line + resume banner (#6) */}
      <ReadingProgress slug={story.slug} />

      {/* Reading toolbar — audio, downloads, comfort settings (#19/#20) */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 -mt-7 relative z-10">
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 md:p-5 shadow-[var(--shadow-card)]">
          {/* Round play button on the left, stacked downloads on the right. */}
          <div className="flex items-center justify-between gap-4">
            <AudioPlayer
              round
              title={story.title}
              audioUrl={story.audioUrl}
              chapterCount={3}
            />
            <DownloadButtons
              stacked
              pdf={{
                title: story.title,
                meta: `${tAll(`genres.${story.genre}`)} · ${age} · ${story.readingMinutes} min`,
                // Full content goes to the PDF regardless of what's shown on
                // screen: interactive stories export every branch, linear
                // stories export the body.
                paragraphs: story.interactive ? [] : body,
                quiz,
                glossary,
                interactive,
              }}
            />
          </div>
          {/* Centered controls: favorite, share, report, text size, dyslexia. */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[var(--color-ink-100)] pt-4">
            <FavoriteButton slug={story.slug} />
            <ShareButton />
            <ReportDialog slug={story.slug} />
            <ReadingSettings />
          </div>
        </div>
      </section>

      {/* Body — single centered column, wider measure (#5) */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 py-10 md:py-14">
        <div id="story-body" className="prose-reading reading-size-m mx-auto max-w-[74ch]">
          {story.interactive && interactive ? (
            <InteractiveStory tree={interactive} />
          ) : (
            <>
              {body.map((p, i) => {
                const isDialogue = p.trimStart().startsWith("«");
                const chapterStart = i > 0 && i % 4 === 0;
                return (
                  <p
                    key={i}
                    id={i % 4 === 0 ? `chapitre-${i / 4 + 1}` : undefined}
                    className={cn(
                      i === 0 && "drop-cap",
                      isDialogue && "dialogue",
                      // Clear visual break between chapters (#3)
                      chapterStart &&
                        "!mt-14 border-t border-[var(--color-ink-100)] pt-10"
                    )}
                  >
                    {withGlossary(p, glossary)}
                  </p>
                );
              })}
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
            </>
          )}
        </div>
      </section>

      {/* Rating + actions side by side at the end (#12), quiz, open glossary (#30) */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 pb-12 space-y-6">
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6">
          <RatingStars slug={story.slug} average={story.rating} count={story.ratingCount} />
          <div className="mt-5 flex flex-wrap justify-center gap-1 border-t border-[var(--color-ink-100)] pt-4">
            <FavoriteButton slug={story.slug} />
            <ShareButton />
            <ReportDialog slug={story.slug} />
          </div>
        </div>

        <StoryQuiz questions={quiz} />

        {/* Glossary — open by default (#30) */}
        <details open className="group rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 open:pb-4">
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

        {/* Print prompt */}
        <div className="rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-6">
          <h3 className="font-serif text-lg tracking-tight">{t("printPromptTitle")}</h3>
          <p className="text-sm text-[var(--color-ink-600)] mt-2 leading-relaxed">
            {t("printPromptBody")}
          </p>
          <Button variant="mint" size="sm" className="mt-4">
            {t("printCta")}
          </Button>
        </div>

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

        {/* Free tags — all clickable (#10), route to library search */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("themesLabel")}
          </span>
          {story.tags.map((tag) => (
            <Link
              key={tag}
              href={{ pathname: "/histoires", query: { q: tag } }}
              className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
            >
              #{tag}
            </Link>
          ))}
          <Link
            href={{
              pathname: "/histoires/genre/[genre]",
              params: { genre: story.genre },
            }}
            className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
          >
            {tAll(`genres.${story.genre}`)}
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) return {};
  const image = storyImageSrc(slug);
  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      type: "article",
      images: image ? [image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return mockStories.map((s) => ({ slug: s.slug }));
}
