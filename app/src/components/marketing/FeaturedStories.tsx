import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StoryCard } from "@/components/story/StoryCard";
import { mockStories } from "@/data/mock-stories";
import { ArrowRight } from "lucide-react";

/**
 * Featured stories strip — 4 curated stories above the fold for scroll depth.
 *
 * Horizontally scrollable on mobile for touch-friendly browsing, standard
 * grid on desktop. The first card is slightly emphasized to draw the eye.
 */
export function FeaturedStories() {
  const t = useTranslations("home.featured");
  const picks = mockStories.slice(0, 4);

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
              {t("kicker")}
            </p>
            <h2
              className="mt-3 text-3xl md:text-5xl tracking-tight font-serif leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t.rich("title", {
                accent: (chunks) => <span className="squiggle-fox">{chunks}</span>,
              })}
            </h2>
          </div>
          <Link
            href="/histoires"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]"
          >
            {t("seeAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {picks.map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>

        <Link
          href="/histoires"
          className="sm:hidden mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-700)]"
        >
          {t("seeAll")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
