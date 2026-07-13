"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { findCustomStory, type CustomStory } from "@/lib/customStories";
import { getActiveProfileId } from "@/lib/profiles";
import { fetchCustomStory, ensureCustomStoryImage } from "@/app/actions/customStories";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import { DownloadButtons } from "@/components/story/DownloadButtons";
import { StoryQuiz } from "@/components/story/StoryQuiz";
import { ReadingProgress } from "@/components/story/ReadingProgress";
import { ReadingSettings } from "@/components/story/ReadingSettings";
import { FavoriteButton, ShareButton, ReportDialog } from "@/components/story/StoryActions";
import { FoxImagePlaceholder } from "@/components/brand/FoxImagePlaceholder";
import { HeroImageZoom } from "@/components/story/HeroImageZoom";
import { Header } from "@/components/layout/Header";
import { AutoHideHeader } from "@/components/layout/AutoHideHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Lock, Pencil, Sparkles, ThumbsDown, ThumbsUp, Wand2 } from "lucide-react";
import { profileScopedKey } from "@/lib/userScope";
import { cn } from "@/lib/utils/cn";
import type { QuizQuestion } from "@/data/mock-stories";

/**
 * Personalized story page (#14) — same reading experience as a library story:
 * progress bar, resume, audio, favorite/share/report, text settings, styled
 * dialogue, glossary (when the generation produced one), quiz, print prompt,
 * and the "next episode" flow (auto or customized).
 */

/* ------------------------------------------------------------------ */
/* Quiz — decoys and order are seeded by the story id, so every story  */
/* gets DIFFERENT wrong answers (stable across reloads of that story). */
/* ------------------------------------------------------------------ */

const DECOY_NAMES = ["Filo", "Vaïa", "Marius", "Louna", "Sacha", "Poppy", "Timo", "Nino", "Célestine", "Basile"];
const DECOY_PLACES = [
  "Dans une école de pirates",
  "Au fond d'un volcan endormi",
  "Sur la Lune",
  "Dans un château en sucre",
  "Au pays des nuages",
  "Dans une forêt de bonbons",
  "Au sommet d'une montagne qui chante",
  "Dans la poche d'un géant",
];
const DECOY_COMPANIONS = [
  "Un dragon grognon",
  "Un robot très poli",
  "Une souris chef d'orchestre",
  "Un nuage bavard",
  "Un hibou bibliothécaire",
  "Une tortue pressée",
  "Personne du tout",
];

/** Tiny deterministic RNG (mulberry32) seeded from the story id. */
function seededRandom(seedText: string): () => number {
  let h = 1779033703;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick n distinct entries (excluding any equal to `not`), then shuffle. */
function pickDecoys(pool: string[], n: number, rand: () => number, not: string): string[] {
  const candidates = pool.filter((x) => x.toLowerCase() !== not.toLowerCase());
  const out: string[] = [];
  while (out.length < n && candidates.length) {
    const i = Math.floor(rand() * candidates.length);
    out.push(candidates.splice(i, 1)[0]);
  }
  return out;
}

function shuffledQuestion(
  question: string,
  correct: string,
  decoys: string[],
  explanation: string,
  rand: () => number
): QuizQuestion {
  const choices = [correct, ...decoys];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { question, choices, answer: choices.indexOf(correct), explanation };
}

/** Param-based quiz until the pipeline generates one with the story. */
function buildQuiz(story: CustomStory): QuizQuestion[] {
  const { heroName, place, friend } = story.params;
  const rand = seededRandom(story.id);
  return [
    shuffledQuestion(
      "Comment s'appelle le héros de cette histoire ?",
      heroName,
      pickDecoys(DECOY_NAMES, 2, rand, heroName),
      `C'est bien ${heroName}, le héros de cette histoire rien qu'à lui.`,
      rand
    ),
    shuffledQuestion(
      "Où se passe une partie de l'aventure ?",
      place || "Près des étoiles",
      pickDecoys(DECOY_PLACES, 2, rand, place || ""),
      place
        ? `L'histoire passe par ${place}.`
        : "L'aventure emmène le héros tout près des étoiles.",
      rand
    ),
    shuffledQuestion(
      "Qui accompagne le héros ?",
      friend || "Une luciole nommée Lumi",
      pickDecoys(DECOY_COMPANIONS, 2, rand, friend || ""),
      friend
        ? `${friend} accompagne le héros dans l'aventure.`
        : "Une luciole nommée Lumi guide le héros.",
      rand
    ),
  ];
}

type Glossary = { word: string; definition: string }[];

/** Wrap glossary words (first occurrence each, tracked via `used`) with a tooltip. */
function applyGlossary(text: string, glossary: Glossary, used: Set<string>): ReactNode[] {
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
 * Render a paragraph like library stories: only the words SPOKEN inside «...»
 * are italic (not the whole line), and glossary terms get their hover tooltip.
 */
function renderParagraph(text: string, glossary: Glossary): ReactNode[] {
  const used = new Set<string>();
  const out: ReactNode[] = [];
  const re = /«[^»]*»/g;
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

export default function CustomStoryPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<CustomStory | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  // Whose space are we in? Set once on mount so the back link is correct:
  // child (bubble active) => /enfant, parent (no active profile) => /compte.
  const [backHref, setBackHref] = useState<"/enfant" | "/compte">("/compte");
  // Lazy illustration: cached URL from the row, or generated on first view.
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    setBackHref(getActiveProfileId() ? "/enfant" : "/compte");
  }, []);

  useEffect(() => {
    // Local-first (instant on the creating device + offline), then fall back to
    // the DB so a shared link resolves on any other device.
    const local = findCustomStory(params.id);
    if (local) {
      setStory(local);
      return;
    }
    let cancelled = false;
    fetchCustomStory(params.id)
      .then((remote) => {
        if (!cancelled) setStory(remote ?? null);
      })
      .catch(() => {
        if (!cancelled) setStory(null);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Illustration: DB-backed stories (PS- ids) get a real generated image,
  // created on first view then cached on the story row for everyone.
  useEffect(() => {
    if (!story || !story.id.startsWith("PS-")) return;
    if (story.imageUrl) {
      setImageUrl(story.imageUrl);
      return;
    }
    let cancelled = false;
    setImageLoading(true);
    ensureCustomStoryImage(story.id)
      .then((res) => {
        if (!cancelled && res.ok) setImageUrl(res.url);
      })
      .finally(() => {
        if (!cancelled) setImageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [story]);

  // Quick thumbs feedback (lighter than stars for a private story). Stored
  // per account + active profile so each reader keeps their own opinion.
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (!story) return;
    try {
      const v = localStorage.getItem(profileScopedKey(`lunireve:feedback:${story.id}`));
      if (v === "up" || v === "down") setFeedback(v);
    } catch {
      /* ignore */
    }
  }, [story]);
  function giveFeedback(v: "up" | "down") {
    if (!story) return;
    setFeedback(v);
    try {
      localStorage.setItem(profileScopedKey(`lunireve:feedback:${story.id}`), v);
    } catch {
      /* ignore */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (story === undefined) return null;

  if (story === null) {
    return (
      <section className="mx-auto max-w-md px-5 py-24 text-center">
        <Lock className="mx-auto h-8 w-8 text-[var(--color-ink-400)]" />
        <h1 className="mt-5 font-serif text-2xl tracking-tight">
          {t("customStory.notFoundTitle")}
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-500)] leading-relaxed">
          {t("customStory.notFoundBody")}
        </p>
        <Link
          href="/creer"
          className="mt-6 inline-block rounded-xl bg-[var(--color-ink-800)] px-5 py-2.5 text-sm text-[var(--color-cream-50)]"
        >
          {t("child.createStory")}
        </Link>
      </section>
    );
  }

  // Accurate reading time from the real word count (~140 words/min read aloud).
  const words = story.body.join(" ").split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 140));
  // Teaser: the story's first sentence, shown under the title like a summary.
  const firstPara = story.body[0] ?? "";
  const sentenceMatch = firstPara.match(/^[^.!?]*[.!?]/);
  const teaser = sentenceMatch ? sentenceMatch[0].trim() : firstPara.slice(0, 140);

  return (
    <>
      {/* Full site navbar (theme toggle, navigation), auto-hidden on scroll
          down and restored on scroll up, exactly like library story pages.
          display:contents wrapper: a plain div would become the sticky
          header's containing block and it would scroll away with the page. */}
      <div className="contents" data-no-print>
        <Header />
      </div>
      <AutoHideHeader />
      {/* Reading progress bar, pinned under the navbar */}
      <ReadingProgress slug={story.id} />

      {/* Hero — same treatment as library stories: the story's illustration
          as background under a dark scrim (not a blur), badges, title, teaser */}
      <section
        className={cn("relative h-[50svh] md:h-[60svh] bg-fixed", !imageUrl && "cover-night")}
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/20" />
        {/* Click the hero to open the illustration fullscreen */}
        {imageUrl && (
          <HeroImageZoom src={imageUrl} alt={story.title} label={t("story.openIllustration")} />
        )}
        <div className="absolute left-0 right-0 top-4 z-20 mx-auto max-w-4xl px-5 md:px-8" data-no-print>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3.5 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-black/40"
          >
            <ArrowLeft className="h-4 w-4" />
            {backHref === "/enfant" ? t("customStory.back") : t("customStory.backParent")}
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-4xl px-5 md:px-8 pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="fox" className="border-0">{t("customStory.badge")}</Badge>
            <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
              {t(`themes.${story.params.theme}`)}
            </Badge>
            <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
              {t(`create.mood_${story.params.mood}`)}
            </Badge>
            <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
              {t("blog.readTime", { minutes: readingMinutes })}
            </Badge>
          </div>
          <h1
            className="mt-4 font-serif text-3xl md:text-6xl text-white tracking-tight leading-[1.04] max-w-3xl drop-shadow-sm"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500" }}
          >
            {story.title}
          </h1>
          {teaser && (
            <p className="mt-4 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed">
              {teaser}
            </p>
          )}
        </div>
      </section>

      {/* Toolbar — audio, downloads, then the same controls as any story */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 -mt-7 relative z-30" data-no-print>
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center gap-2">
            <AudioPlayer
              title={story.title}
              audioUrl={null}
              chapterCount={1}
              storyId={story.id.startsWith("PS-") ? story.id : undefined}
              tier="personalized"
              language={story.params.language}
            />
            <DownloadButtons
              pdf={{
                title: story.title,
                meta: `${t(`themes.${story.params.theme}`)} · ${story.params.heroName}`,
                paragraphs: story.body,
                quiz: buildQuiz(story),
                glossary: story.glossary,
                locale: story.params.language,
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[var(--color-ink-100)] pt-4">
            <FavoriteButton slug={story.id} />
            <ShareButton />
            <ReportDialog slug={story.id} />
            <ReadingSettings />
          </div>
        </div>
        {/* Usage note: personal use, upgrade path for more */}
        <p className="mt-3 text-center text-[11px] text-[var(--color-ink-400)]">
          {t("story.licenseNote")}{" "}
          <Link href="/tarifs" className="underline underline-offset-2 hover:text-[var(--color-ink-700)]">
            {t("story.licenseCta")}
          </Link>
        </p>
      </section>

      {/* Illustration + body */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 py-10">
        {imageUrl ? (
          <div className="relative mb-10 aspect-square w-full max-w-2xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Illustration : ${story.title}`}
              className="h-full w-full rounded-3xl object-cover shadow-[var(--shadow-card)]"
            />
            <HeroImageZoom src={imageUrl} alt={story.title} label={t("story.openIllustration")} />
          </div>
        ) : imageLoading ? (
          <div
            aria-hidden
            className="mb-10 aspect-square w-full max-w-2xl mx-auto animate-pulse rounded-3xl bg-[var(--color-cream-200)]"
          />
        ) : (
          <FoxImagePlaceholder
            slotId={`custom-${story.id.slice(0, 8)}`}
            aspect="21:9"
            prompt={`Illustration for a personalized children's story: hero ${story.params.heroName}, theme ${story.params.theme}, style ${story.params.style}. Warm night-sky palette, no text.`}
            className="mb-10"
          />
        )}

        <div id="story-body" className="prose-reading reading-size-m mx-auto">
          {story.body.map((p, i) => (
            <p key={i} className={cn(i === 0 && "drop-cap")}>
              {renderParagraph(p, story.glossary ?? [])}
            </p>
          ))}
          <p className="not-prose-reading mt-10 text-center italic text-[var(--color-ink-500)]">
            {t("story.endNote")}
          </p>
        </div>
      </section>

      {/* Quiz + glossary + print + next episode + share */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 pb-16 space-y-6" data-no-print>
        {/* Quick thumbs feedback (lighter than stars for a private story) */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5">
          <p className="text-sm font-medium text-[var(--color-ink-700)]">
            {feedback ? t("customStory.feedbackThanks") : t("customStory.feedbackTitle")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("customStory.feedbackUp")}
              aria-pressed={feedback === "up"}
              onClick={() => giveFeedback("up")}
              className={cn(
                "rounded-full border p-2.5 transition-colors",
                feedback === "up"
                  ? "border-transparent bg-[var(--color-mint-400)] text-[#17224a]"
                  : "border-[var(--color-ink-100)] text-[var(--color-ink-500)] hover:bg-[var(--color-mint-100)]"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("customStory.feedbackDown")}
              aria-pressed={feedback === "down"}
              onClick={() => giveFeedback("down")}
              className={cn(
                "rounded-full border p-2.5 transition-colors",
                feedback === "down"
                  ? "border-transparent bg-[var(--color-fox-300)] text-[#17224a]"
                  : "border-[var(--color-ink-100)] text-[var(--color-ink-500)] hover:bg-[var(--color-cream-100)]"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <StoryQuiz questions={buildQuiz(story)} slug={story.id} />

        {/* Glossary — only when the generation flagged difficult words */}
        {story.glossary && story.glossary.length > 0 && (
          <details open className="group rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 open:pb-4">
            <summary className="cursor-pointer list-none">
              <span className="font-serif text-xl tracking-tight">{t("story.glossaryTitle")}</span>
              <span className="block mt-1 text-xs text-[var(--color-ink-400)]">
                {t("story.glossaryHint")}
              </span>
            </summary>
            <dl className="mt-4 space-y-3 border-t border-[var(--color-ink-100)] pt-4">
              {story.glossary.map((g) => (
                <div key={g.word}>
                  <dt className="font-medium text-[var(--color-ink-800)]">{g.word}</dt>
                  <dd className="text-sm text-[var(--color-ink-600)]">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        {/* Print prompt — same conversion nudge as library stories */}
        <div className="rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-6">
          <h2 className="font-serif text-lg tracking-tight">{t("story.printPromptTitle")}</h2>
          <p className="text-sm text-[var(--color-ink-600)] mt-2 leading-relaxed">
            {t("story.printPromptBody")}
          </p>
          <Button variant="mint" size="sm" className="mt-4">
            {t("story.printCta")}
          </Button>
        </div>

        {/* Next episode — auto (same cast, new plot) or customized (4 steps prefilled) */}
        <div className="band-ink relative overflow-hidden rounded-3xl p-7 md:p-9 text-[var(--color-cream-50)]">
          <Sparkles aria-hidden className="absolute right-5 top-5 h-8 w-8 text-[var(--color-mint-400)] opacity-60" />
          <h2 className="font-serif text-xl md:text-2xl tracking-tight max-w-md leading-snug">
            {t("create.nextEpisodeTitle", { name: story.params.heroName })}
          </h2>
          <p className="mt-2 max-w-md text-sm text-[var(--color-indigo-soft-200)]">
            {t("create.nextEpisodeBody")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="mint" size="md">
              <Link href={{ pathname: "/creer", query: { from: story.id, next: "auto" } }}>
                <Wand2 className="h-4 w-4" />
                {t("create.nextEpisodeAuto")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="md"
              className="border-[var(--color-indigo-soft-400)] text-[var(--color-cream-50)] hover:bg-white/10"
            >
              <Link href={{ pathname: "/creer", query: { from: story.id, next: "custom" } }}>
                <Pencil className="h-4 w-4" />
                {t("create.nextEpisodeCustom")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-6">
          <h2 className="font-serif text-lg tracking-tight">{t("create.shareTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-600)] leading-relaxed">
            {t("create.shareBody")}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-200)] bg-[var(--color-cream-50)] px-4 py-2 text-sm hover:bg-[var(--color-cream-100)]"
          >
            <Copy className="h-4 w-4" />
            {copied ? t("create.shareCopied") : t("create.shareCopy")}
          </button>
        </div>
      </section>
    </>
  );
}
