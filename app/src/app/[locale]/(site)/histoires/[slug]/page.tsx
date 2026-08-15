// Static + ISR: served from the CDN, revalidated hourly. Keeps crawler and
// prefetch traffic off serverless functions (see Vercel usage incident).
export const dynamic = "force-static";
export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  findStory,
  storyTitle,
  audioChapterOffsets,
  storyExcerpt,
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
import { HeroImageZoom } from "@/components/story/HeroImageZoom";
import { StoryBreadcrumb } from "@/components/story/StoryBreadcrumb";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import { DownloadButtons } from "@/components/story/DownloadButtons";
import { FavoriteButton, ShareButton, ReportDialog } from "@/components/story/StoryActions";
import { RatingStars } from "@/components/story/RatingStars";
import { ReadingProgress } from "@/components/story/ReadingProgress";
import { ReadingSettings } from "@/components/story/ReadingSettings";
import { StoryQuiz } from "@/components/story/StoryQuiz";
import { StoryGlossaryPanel } from "@/components/story/StoryGlossaryPanel";
import { InteractiveStory } from "@/components/story/InteractiveStory";
import { AutoHideHeader } from "@/components/layout/AutoHideHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Headphones, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { JsonLd } from "@/components/seo/JsonLd";
import { seoAlternates, absoluteUrl, SITE_URL } from "@/lib/seo";

/**
 * Story page V2 — feedback round 1:
 * full-viewport parallax hero (#1), progress line under navbar (#6),
 * clickable chips and tags (#10), inline dotted glossary terms (#11),
 * actions next to rating at the end (#12), interactive branching (#14),
 * centered single-column reading layout (#19), working text size +
 * dyslexia (#20), real ratings with login gate (#3/#22), open glossary (#30).
 */

/** Wrap glossary words (first occurrence each, tracked via `used`) in a tooltip. */
function applyGlossary(
  text: string,
  glossary: GlossaryEntry[],
  used: Set<string>
): ReactNode[] {
  let parts: ReactNode[] = [text];
  for (const entry of glossary) {
    if (used.has(entry.word)) continue;
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
      used.add(entry.word);
      next.push(part.slice(0, idx));
      next.push(
        <span key={`${entry.word}-${idx}`} className="glossary-term" tabIndex={0}>
          {part.slice(idx, idx + entry.word.length)}
          {/* Definition lives in the DOM (not a CSS attr) so it always renders. */}
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

/**
 * Render a paragraph: only the words SPOKEN by a character (inside « … »)
 * are italic, not the whole line, and glossary terms get their tooltip.
 */
function renderParagraph(text: string, glossary: GlossaryEntry[]): ReactNode[] {
  const used = new Set<string>();
  const out: ReactNode[] = [];
  // French guillemets and English curly quotes both mark spoken lines, so the
  // dialogue styling applies in either language (straight quotes are left out:
  // an apostrophe would swallow half a paragraph).
  const re = /«[^»]*»|“[^”]*”/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...applyGlossary(text.slice(last, m.index), glossary, used));
    out.push(
      <em key={`q${key++}`} className="italic text-[var(--color-indigo-soft-700)]">
        {applyGlossary(m[0], glossary, used)}
      </em>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...applyGlossary(text.slice(last), glossary, used));
  return out;
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
  const title = storyTitle(story, locale);
  const excerpt = storyExcerpt(story, locale);

  const body = storyBody(slug, locale);
  // Interactive stories carry their own branching tree, quiz and glossary so
  // the quiz matches the story the reader actually plays (not the fallback).
  const interactive = story.interactive ? interactiveTree(slug, locale) : undefined;
  const quiz = story.interactive ? interactiveQuiz(locale) : storyQuiz(slug, locale);
  const glossary = story.interactive ? interactiveGlossary(locale) : storyGlossary(slug, locale);
  const age = ageLabel(story.ageRange, locale);
  const bucket = durationBucket(story.readingMinutes);
  const heroImg = storyImageSrc(slug);

  const related = mockStories
    .filter((s) => s.slug !== slug && (s.theme === story.theme || s.ageRange === story.ageRange))
    .slice(0, 3);

  const chipClass =
    "rounded-full border border-white/30 bg-black/25 px-3 py-1 text-xs text-white backdrop-blur-sm hover:bg-black/40 transition-colors";

  const storyUrl = absoluteUrl(locale, { pathname: "/histoires/[slug]", params: { slug } });

  return (
    <>
      {/* Structured data: the story as a CreativeWork + breadcrumb trail */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ShortStory",
          name: title,
          headline: title,
          description: excerpt,
          url: storyUrl,
          inLanguage: locale === "en" ? "en" : "fr",
          datePublished: story.publishedAt,
          genre: tAll(`genres.${story.genre}`),
          timeRequired: `PT${story.readingMinutes}M`,
          isAccessibleForFree: true,
          publisher: { "@id": `${SITE_URL}/#organization` },
          ...(heroImg ? { image: `${SITE_URL}${heroImg}` } : {}),
          audience: {
            "@type": "PeopleAudience",
            suggestedMinAge: parseInt(story.ageRange, 10) || 1,
            suggestedMaxAge: parseInt(story.ageRange.split("-")[1] ?? "12", 10) || 12,
          },
          ...(story.ratingCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: story.rating,
                  ratingCount: story.ratingCount,
                },
              }
            : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Lunireve",
              item: locale === "en" ? `${SITE_URL}/en` : SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: tAll(`genres.${story.genre}`),
              item: absoluteUrl(locale, {
                pathname: "/histoires/genre/[genre]",
                params: { genre: story.genre },
              }),
            },
            { "@type": "ListItem", position: 3, name: title, item: storyUrl },
          ],
        }}
      />
      {/* Navbar slides away on scroll down, back on scroll up (reading mode) */}
      <AutoHideHeader />
      {/* Full-viewport parallax hero (#1) — bg-fixed keeps the cover still
          while the page scrolls over it. Image slot: the real illustration
          becomes a fixed-attachment background at /illustrations/story-<slug>.png */}
      <section
        className={cn("relative h-[72svh] md:h-[88svh]", !heroImg && story.cover)}
        style={
          heroImg
            ? {
                backgroundImage: `url(${heroImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {/* Click the hero to open the illustration fullscreen */}
        {heroImg && (
          <HeroImageZoom src={heroImg} alt={title} label={t("openIllustration")} />
        )}
        {/* Breadcrumb sits ON the illustration (#33), styled like the old
            back-to-library button which it replaces. */}
        <div className="absolute left-0 right-0 top-4 z-20 mx-auto max-w-5xl px-5 md:px-8">
          <StoryBreadcrumb
            onImage
            trail={[
              { label: tAll(`genres.${story.genre}`), href: { pathname: "/histoires/genre/[genre]", params: { genre: story.genre } } },
              { label: title },
            ]}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-5xl px-5 md:px-8 pb-10 md:pb-16">
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
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed">
            {excerpt}
          </p>
        </div>
      </section>

      {/* Progress line + resume banner (#6) */}
      <ReadingProgress slug={story.slug} />

      {/* Reading toolbar — audio, downloads, comfort settings (#19/#20) */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 -mt-7 relative z-30">
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 md:p-5 shadow-[var(--shadow-card)]">
          {/* Two columns: round play button centered left, stacked downloads
              centered right (buttons left-aligned to each other). Stacks on mobile. */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-center">
            <div className="flex justify-center">
              <AudioPlayer
                round
                title={title}
                audioUrl={story.audioUrl}
                language={story.language}
                chapterOffsets={audioChapterOffsets(body)}
                storyId={story.slug}
                tier="library"
              />
            </div>
            <div className="flex justify-center">
              <DownloadButtons
                stacked
                locale={locale}
                pdf={{
                title: title,
                meta: `${tAll(`genres.${story.genre}`)} · ${age} · ${story.readingMinutes} min`,
                // Full content goes to the PDF regardless of what's shown on
                // screen: interactive stories export every branch, linear
                // stories export the body.
                paragraphs: story.interactive ? [] : body,
                quiz,
                glossary,
                interactive,
                coverImage: heroImg ?? undefined,
              }}
              />
            </div>
          </div>
          {/* Centered controls: favorite, share, report, text size, dyslexia. */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[var(--color-ink-100)] pt-4">
            <FavoriteButton slug={story.slug} />
            <ShareButton />
            <ReportDialog slug={story.slug} />
            <ReadingSettings />
          </div>
        </div>
        {/* Usage note: personal use, upgrade path for more */}
        <p className="mt-3 text-center text-[11px] text-[var(--color-ink-400)]">
          {t("licenseNote")}{" "}
          <Link href="/tarifs" className="underline underline-offset-2 hover:text-[var(--color-ink-700)]">
            {t("licenseCta")}
          </Link>
        </p>
      </section>

      {/* Body — single centered column, wider measure (#5) */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 py-10 md:py-14">
        {/* Inline illustration card (same layout as personalized stories) */}
        {heroImg && (
          <div className="relative mb-10 aspect-square w-full max-w-2xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt={`Illustration : ${title}`}
              className="h-full w-full rounded-3xl object-cover shadow-[var(--shadow-card)]"
            />
            <HeroImageZoom src={heroImg} alt={title} label={t("openIllustration")} />
          </div>
        )}
        <div id="story-body" className="prose-reading reading-size-m mx-auto">
          {story.interactive && interactive ? (
            <InteractiveStory tree={interactive} />
          ) : (
            <>
              {body.map((p, i) => {
                const chapterStart = i > 0 && i % 4 === 0;
                return (
                  <p
                    key={i}
                    id={i % 4 === 0 ? `chapitre-${i / 4 + 1}` : undefined}
                    className={cn(
                      i === 0 && "drop-cap",
                      // Clear visual break between chapters (#3)
                      chapterStart &&
                        "!mt-14 border-t border-[var(--color-ink-100)] pt-10"
                    )}
                  >
                    {renderParagraph(p, glossary)}
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

      {/* Rating CTA — wide (body width) to push engagement (#) */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 pt-12">
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-7 md:p-9">
          <RatingStars slug={story.slug} average={story.rating} count={story.ratingCount} />
          <div className="mt-5 flex flex-wrap justify-center gap-1 border-t border-[var(--color-ink-100)] pt-4">
            <FavoriteButton slug={story.slug} />
            <ShareButton />
            <ReportDialog slug={story.slug} />
          </div>
        </div>
      </section>

      {/* Quiz + glossary + print — standard reading width */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 pt-6 space-y-6">
        <StoryQuiz questions={quiz} slug={story.slug} />

        {/* Loved it? One tap creates the NEXT chapter of this exact story:
            /creer opens prefilled from this book (hero, theme, title) with a
            brand-new plot, landing on the recap step. */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-[var(--color-mint-500)] bg-[var(--color-mint-100)] p-6 md:p-8">
          <Sparkles
            aria-hidden
            className="absolute -right-4 -top-4 h-24 w-24 text-[var(--color-mint-500)] opacity-15"
          />
          <p className="text-xs uppercase tracking-widest text-[var(--color-ink-600)]">
            {t("sequelKicker")}
          </p>
          <h2 className="mt-2 font-serif text-xl md:text-2xl tracking-tight">
            {t("sequelTitle", { title: title })}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-600)]">
            {t("sequelBody")}
          </p>
          {/* whitespace-normal: the default nowrap made this long label set a
              width no 375px screen could honour. */}
          <Button
            asChild
            variant="primary"
            size="md"
            className="mt-5 h-auto max-w-full whitespace-normal py-3 text-center leading-snug"
          >
            <Link href={{ pathname: "/creer", query: { fromLib: story.slug } }}>
              {t("sequelCta")}
            </Link>
          </Button>
        </div>

        {/* Glossary — open on desktop, collapsed on phones where it pushed the
            related stories a full screen down (#30 + mobile feedback). */}
        <StoryGlossaryPanel title={t("glossaryTitle")} hint={t("glossaryHint")} entries={glossary} />

        {/* The "commander le livre imprimé" block lived here. Pulled until the
            print partner is set up: see app/_archive/print-prompt/README.md for
            the exact markup and message keys to restore. */}
      </section>

      {/* Personalize CTA — wide (body width), bigger and centered to convert (#) */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 pt-6">
        <div className="band-ink relative overflow-hidden rounded-3xl p-8 md:p-12 text-center text-[var(--color-cream-50)]">
          <Sparkles aria-hidden className="absolute right-6 top-6 h-9 w-9 text-[var(--color-mint-400)] opacity-60" />
          <h3 className="mx-auto font-serif text-2xl md:text-3xl tracking-tight max-w-xl leading-[1.12]">
            {t("personalizeTitle")}
          </h3>
          <p className="mx-auto mt-3 text-sm md:text-base text-[var(--color-indigo-soft-200)] max-w-xl leading-relaxed">
            {t("personalizeBody")}
          </p>
          <Button asChild variant="mint" size="lg" className="mt-6">
            <Link href="/creer">{t("personalizeCta")}</Link>
          </Button>
        </div>
      </section>

      {/* Free tags — all clickable (#10), route to library search */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 pt-6 pb-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("themesLabel")}
          </span>
          {story.tags.map((tag) => (
            <Link
              key={tag}
              href={{ pathname: "/histoires", query: { tag } }}
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
            {t("relatedIn", { genre: tAll(`genres.${story.genre}`), age })}
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {related.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
          {/* Past the three picks, open the library on the same genre AND age,
              which is exactly how `related` above was chosen. */}
          <div className="mt-8 flex justify-center">
            <Link
              href={{
                pathname: "/histoires",
                query: { genre: story.genre, age: story.ageRange },
              }}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--color-ink-200)] bg-[var(--color-cream-50)] px-5 py-3 text-center text-sm font-medium text-[var(--color-ink-700)] transition-colors hover:bg-[var(--color-cream-200)]"
            >
              {t("relatedMore", { genre: tAll(`genres.${story.genre}`), age })}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
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
  const { locale, slug } = await params;
  const story = findStory(slug);
  if (!story) return {};
  const title = storyTitle(story, locale);
  const excerpt = storyExcerpt(story, locale);
  const image = storyImageSrc(slug);
  return {
    title: title,
    description: excerpt,
    alternates: seoAlternates(locale, { pathname: "/histoires/[slug]", params: { slug } }),
    openGraph: {
      title: title,
      description: excerpt,
      type: "article",
      images: image ? [image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return mockStories.map((s) => ({ slug: s.slug }));
}
