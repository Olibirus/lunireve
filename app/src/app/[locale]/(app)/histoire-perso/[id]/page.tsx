"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { findCustomStory, type CustomStory } from "@/lib/customStories";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import { DownloadButtons } from "@/components/story/DownloadButtons";
import { StoryQuiz } from "@/components/story/StoryQuiz";
import { FoxImagePlaceholder } from "@/components/brand/FoxImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QuizQuestion } from "@/data/mock-stories";

/**
 * Personalized story page (#14) — a real story page with its own shareable
 * URL (/histoire-perso/<id>): hero, chips, illustration slot, audio,
 * downloads, quiz, share card. Stored locally for now, so the link works
 * on this device; cross-device sharing arrives when stories move to the DB.
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

export default function CustomStoryPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<CustomStory | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStory(findCustomStory(params.id) ?? null);
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
            <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
              {t(`create.length_${story.params.length}`)}
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

      {/* Toolbar */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 -mt-7 relative z-10" data-no-print>
        <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center gap-2">
            <AudioPlayer title={story.title} audioUrl={null} chapterCount={1} />
            <DownloadButtons
              pdf={{
                title: story.title,
                meta: `${t(`themes.${story.params.theme}`)} · ${story.params.heroName}`,
                paragraphs: story.body,
                quiz: buildQuiz(story),
              }}
            />
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
          {story.body.map((p, i) => (
            <p
              key={i}
              className={cn(
                i === 0 && "drop-cap",
                p.trimStart().startsWith("«") && "dialogue"
              )}
            >
              {p}
            </p>
          ))}
          <p className="not-prose-reading mt-10 text-center italic text-[var(--color-ink-500)]">
            {t("story.endNote")}
          </p>
        </div>
      </section>

      {/* Quiz + share */}
      <section className="mx-auto max-w-3xl px-5 md:px-8 pb-16 space-y-6" data-no-print>
        <StoryQuiz questions={buildQuiz(story)} />

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
