"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mockStories, type MockStory } from "@/data/mock-stories";
import { readHistory, type ReadingRecord } from "@/lib/readingHistory";
import { storyImageSrc } from "@/lib/storyImage";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Item = { story: MockStory; record: ReadingRecord };

/**
 * Parent dashboard "Lu récemment" (#30): the stories this reader has opened,
 * newest first (leftmost), each with the last-read date and quiz result. Four
 * cards fit on screen; with more, left/right arrows page through the rest.
 * Scoped per account + reader, so it never shows another account's history.
 */
export function RecentlyRead() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [items, setItems] = useState<Item[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bySlug = new Map(mockStories.map((s) => [s.slug, s]));
    const list = readHistory()
      .map((record) => {
        const story = bySlug.get(record.slug);
        return story ? { story, record } : null;
      })
      .filter((x): x is Item => x !== null);
    setItems(list);
  }, []);

  if (items.length === 0) return null;

  function page(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  const showArrows = items.length > 4;

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl tracking-tight sparkle">{t("recentlyRead")}</h2>
        {showArrows && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => page(-1)}
              aria-label={t("recentPrev")}
              className="rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-800)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              aria-label={t("recentNext")}
              className="rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-800)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scroller}
        className="mt-4 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ story, record }) => {
          const img = storyImageSrc(story.slug);
          const date = new Date(record.lastReadAt).toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
          });
          return (
            <div
              key={story.slug}
              className="snap-start shrink-0 w-[62%] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-3rem)/4)]"
            >
              <Link
                href={{ pathname: "/histoires/[slug]", params: { slug: story.slug } }}
                className="group block"
              >
                <div className={cn(story.cover, "relative aspect-[4/5] w-full overflow-hidden rounded-2xl")}>
                  {img && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    </>
                  )}
                  {record.quiz && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-[var(--color-mint-400)] text-[var(--color-mint-400)]" />
                      {record.quiz.score}/{record.quiz.total}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-end p-3">
                    <h3
                      className="font-serif text-lg leading-tight text-white drop-shadow-sm"
                      style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'wght' 500" }}
                    >
                      {story.title}
                    </h3>
                  </div>
                </div>
              </Link>
              <p className="mt-1.5 text-xs text-[var(--color-ink-500)]">
                {t("readOn", { date })}
                {record.quiz ? ` · ${t("quizResult", { score: record.quiz.score, total: record.quiz.total })}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
