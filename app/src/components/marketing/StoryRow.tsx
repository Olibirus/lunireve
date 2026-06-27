import { Link } from "@/i18n/navigation";
import { StoryCard } from "@/components/story/StoryCard";
import { SectionStars } from "@/components/marketing/SectionStars";
import type { MockStory } from "@/data/mock-stories";
import { ArrowRight } from "lucide-react";

type Chip = { label: string; href: Parameters<typeof Link>[0]["href"] };

/**
 * Horizontal, scroll-snap carousel of story cards with a heading and a rail of
 * category chips (links into the funnel pages). CSS-only scrolling so it stays
 * a server component, crawlable, and touch-friendly.
 */
export function StoryRow({
  title,
  subtitle,
  stories,
  chips,
  seeAllHref,
  seeAllLabel,
  starOffset = 0,
}: {
  title: string;
  subtitle?: string;
  stories: MockStory[];
  chips?: Chip[];
  seeAllHref?: Parameters<typeof Link>[0]["href"];
  seeAllLabel?: string;
  starOffset?: number;
}) {
  return (
    <section className="relative isolate overflow-hidden py-14 md:py-20">
      <SectionStars offset={starOffset} />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 max-w-xl text-[var(--color-ink-500)] leading-relaxed">{subtitle}</p>
            )}
          </div>
          {seeAllHref && seeAllLabel && (
            <Link
              href={seeAllHref as never}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-indigo-soft-600)] hover:text-[var(--color-ink-800)]"
            >
              {seeAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {chips && chips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {chips.map((c, i) => (
              <Link
                key={i}
                href={c.href as never}
                className="rounded-full border border-[var(--color-ink-100)] px-3 py-1 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scroll-snap row */}
      <div className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:gap-6 md:px-8 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* leading spacer keeps the first card aligned with the max-w container */}
        <div className="shrink-0 w-0 md:w-[max(0px,calc((100vw-80rem)/2))]" aria-hidden />
        {stories.map((s) => (
          <div key={s.slug} className="w-56 shrink-0 snap-start md:w-64">
            <StoryCard story={s} />
          </div>
        ))}
        <div className="shrink-0 w-1" aria-hidden />
      </div>
    </section>
  );
}
