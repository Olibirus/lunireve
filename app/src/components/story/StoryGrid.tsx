"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { MockStory } from "@/data/mock-stories";
import { StoryCard } from "@/components/story/StoryCard";
import { PersonalizedStoryCard } from "@/components/story/PersonalizedStoryCard";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Library grid — 3 cards per row on desktop so the covers read larger
 * (feedback). A personalized-story promo card is always injected as the first
 * cell of the 2nd row. The first 4 rows show fully; the next row is revealed
 * as a blurred, fading teaser behind a "see more" button so the page stays
 * short until the reader asks for more.
 */
const FIRST = 12; // 4 rows x 3 columns on desktop

const GRID = "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6";

export function StoryGrid({ stories }: { stories: MockStory[] }) {
  const t = useTranslations("library");
  const [expanded, setExpanded] = useState(false);

  // Build the full cell list, then drop the promo card in: LAST when there
  // are 6 stories or fewer (it closes a short list), otherwise 5th so it sits
  // high enough to be seen without pushing real stories out of view.
  const cells: ReactNode[] = stories.map((s) => <StoryCard key={s.slug} story={s} />);
  const insertAt = stories.length <= 6 ? cells.length : 4;
  cells.splice(insertAt, 0, <PersonalizedStoryCard key="personalized-card" />);

  if (cells.length <= FIRST) {
    return <div className={GRID}>{cells}</div>;
  }

  const main = cells.slice(0, FIRST);
  const rest = cells.slice(FIRST);
  const teaser = rest.slice(0, 3);

  return (
    <div>
      <div className={GRID}>{main}</div>

      {expanded ? (
        <div className={cn(GRID, "mt-4 md:mt-6")}>{rest}</div>
      ) : (
        <div className="relative mt-4 md:mt-6">
          {/* Teaser row: only the top of each cover shows, blurred and fading
              into the page background. */}
          <div
            aria-hidden
            className={cn(GRID, "pointer-events-none select-none blur-[1.5px]")}
            style={{
              maxHeight: "15rem",
              overflow: "hidden",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 20%, transparent 80%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 20%, transparent 80%)",
            }}
          >
            {teaser}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink-800)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-50)] shadow-[var(--shadow-card)] hover:bg-[var(--color-ink-700)] transition-colors"
            >
              {t("seeMore")}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
