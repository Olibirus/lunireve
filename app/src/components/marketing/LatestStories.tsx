"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mockStories } from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { SectionStars } from "@/components/marketing/SectionStars";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

/**
 * "Latest little stories" (homepage): the most recent stories for the
 * youngest readers (ages 1 to 6), for parents who just want a quick, ready
 * bedtime read without clicking through the whole library. Recomputed from
 * the catalogue on every build/revalidate, so new stories surface here
 * automatically. Horizontal scroll-snap carousel with arrow paging.
 */
const YOUNG_RANGES = new Set(["1-2", "3-4", "5-6"]);

const LATEST = mockStories
  .filter((s) => YOUNG_RANGES.has(s.ageRange))
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, 10);

export function LatestStories() {
  const t = useTranslations();
  const scroller = useRef<HTMLDivElement>(null);

  if (LATEST.length === 0) return null;

  function page(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <section className="relative isolate overflow-hidden py-14 md:py-20">
      <SectionStars />
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("homeV2.latestTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
              {t("homeV2.latestSubtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("library.prev")}
              onClick={() => page(-1)}
              className="rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2.5 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={t("library.next")}
              onClick={() => page(1)}
              className="rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2.5 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scroll-snap track: each card ~1/2 (mobile) to ~1/4 (desktop) wide */}
        <div
          ref={scroller}
          className="mt-6 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 md:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LATEST.map((story) => (
            <div
              key={story.slug}
              className="snap-start shrink-0 w-[62%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
            >
              <StoryCard story={story} />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href={{ pathname: "/histoires", query: { age: "3-4" } }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)] transition-colors"
          >
            {t("homeV2.latestCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
