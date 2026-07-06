"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { findCustomStory, type CustomStory } from "@/lib/customStories";
import { fetchCustomStory } from "@/app/actions/customStories";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import { DownloadButtons } from "@/components/story/DownloadButtons";
import { StoryQuiz } from "@/components/story/StoryQuiz";
import { ReadingProgress } from "@/components/story/ReadingProgress";
import { ReadingSettings } from "@/components/story/ReadingSettings";
import { FavoriteButton, ShareButton, ReportDialog } from "@/components/story/StoryActions";
import { FoxImagePlaceholder } from "@/components/brand/FoxImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Lock, Pencil, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QuizQuestion } from "@/data/mock-stories";

/**
 * Personalized story page (#14) — same reading experience as a library story:
 * progress bar, resume, audio, favorite/share/report, text settings, styled
 * dialogue, glossary (when the generation produced one), quiz, print prompt,
 * and the "next episode" flow (auto or customized).
 */

/** Param-based quiz until the pipeline generates one with the story. */
function buildQuiz(story: CustomStory): QuizQuestion[] {
  const { heroName, place, friend } = story.params;
  return [
    {
      question: `Comment s'appelle le héros de cette histoire ?`,
      choices: [heroName, "Filo", "Vaïa"],
      answer: 0,
      explanation: `C'est bien ${heroName}, le héros de cette histoire rien qu'à lui.`,
    },
    {
      question: "Où se passe une partie de l'aventure ?",
      choices: [
        place || "Près des étoiles",
        "Dans une école de pirates",
        "Au fond d'un volcan",
      ],
      answer: 0,
      explanation: place
        ? `L'histoire passe par ${place}.`
        : "L'aventure emmène le héros tout près des étoiles.",
    },
    {
      question: "Qui accompagne le héros ?",
      choices: [friend || "Une luciole nommée Lumi", "Un dragon grognon", "Personne"],
      answer: 0,
      explanation: friend
        ? `${friend} accompagne le héros dans l'aventure.`
        : "Une luciole nommée Lumi guide le héros.",
    },
  ];
}

/** Inline «...» quotes styled like the library story pages. */
function renderDialogue(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /«[^»]*»/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <em key={`q${key++}`} className="italic text-[var(--color-indigo-soft-700)]">
        {m[0]}
      </em>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function CustomStoryPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<CustomStory | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

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

  return (
    <>
      {/* Reading progress bar + resume banner (same as library stories) */}
      <ReadingProgress slug={story.id} />

      {/* Hero */}
      <section className="cover-night relative h-[50svh] md:h-[60svh] bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-0 right-0 top-4 mx-auto max-w-4xl px-5 md:px-8" data-no-print>
          <Link
            href="/enfant"
            className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3.5 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-black/40"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("customStory.back")}
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-5 md:px-8 pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="fox" className="border-0">{t("customStory.badge")}</Badge>
            <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
              {t(`themes.${story.params.theme}`)}
            </Badge>
            <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
              {t(`create.mood_${story.params.mood}`)}
            </Badge>
          </div>
          <h1
            className="mt-4 font-serif text-3xl md:text-6xl text-white tracking-tight leading-[1.04] max-w-3xl drop-shadow-sm"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500" }}
          >
            {story.title}
          </h1>
        </div>
      </section>

      {/* Toolbar — audio, downloads, then the same controls as any story */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 -mt-7 relative z-10" data-no-print>
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center gap-2">
            <AudioPlayer
              title={story.title}
              audioUrl={null}
              chapterCount={1}
              storyId={story.id.startsWith("PS-") ? story.id : undefined}
              tier="personalized"
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
      </section>

      {/* Illustration slot + body */}
      <section className="mx-auto max-w-4xl px-5 md:px-8 py-10">
        <FoxImagePlaceholder
          slotId={`custom-${story.id.slice(0, 8)}`}
          aspect="21:9"
          prompt={`Illustration for a personalized children's story: hero ${story.params.heroName}, theme ${story.params.theme}, style ${story.params.style}. Warm night-sky palette, no text.`}
          className="mb-10"
        />

        <div id="story-body" className="prose-reading reading-size-m mx-auto max-w-[74ch]">
          {story.body.map((p, i) => {
            const trimmed = p.trimStart();
            const isDialogueLine =
              trimmed.startsWith("«") || trimmed.startsWith("-") || trimmed.startsWith("–");
            return (
              <p key={i} className={cn(i === 0 && "drop-cap", isDialogueLine && "dialogue")}>
                {renderDialogue(p)}
              </p>
            );
          })}
          <p className="not-prose-reading mt-10 text-center italic text-[var(--color-ink-500)]">
            {t("story.endNote")}
          </p>
        </div>
      </section>

      {/* Quiz + glossary + print + next episode + share */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 pb-16 space-y-6" data-no-print>
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
