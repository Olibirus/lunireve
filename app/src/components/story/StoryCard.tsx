import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, Star } from "lucide-react";
import { ageLabel, storyTitle, storyExcerpt, type MockStory } from "@/data/mock-stories";
import { FavoriteHeart } from "@/components/story/FavoriteHeart";
import { storyCardImageSrc } from "@/lib/storyImage";
import { cn } from "@/lib/utils/cn";

/**
 * StoryCard — library grid card. Three zones:
 * 1. Cover: gradient placeholder + decorative type + meta chips
 * 2. Title (Fraunces) + excerpt
 * 3. Meta row: reading time, rating, audio flag
 *
 * Real covers (once n8n generates them) swap into <img /> at the same aspect.
 */
export function StoryCard({ story, size = "md" }: { story: MockStory; size?: "sm" | "md" | "lg" }) {
  const locale = useLocale();
  const age = ageLabel(story.ageRange, locale);
  const img = storyCardImageSrc(story.slug);

  return (
    <Link
      href={{ pathname: "/histoires/[slug]", params: { slug: story.slug } }}
      className={cn(
        "group block rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] overflow-hidden",
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:border-[var(--color-ink-200)] transition-colors"
      )}
    >
      {/* Cover */}
      <div
        className={cn(
          story.cover,
          "relative aspect-[4/5] w-full overflow-hidden",
          size === "sm" && "aspect-[4/3]"
        )}
      >
        {/* Generated cover (if available) over the gradient, with a scrim so
            the white title and badges stay legible. */}
        {img && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* lazy: a grid renders ~20 cards — only visible covers download */}
            <img
              src={img}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              width={640}
              height={800}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </>
        )}
        {/* Decorative title inside the cover (like a book spine) */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Badge variant="ink" className="bg-black/25 text-white border-0 backdrop-blur-sm">
                {age}
              </Badge>
              {story.interactive && (
                <Badge variant="fox" className="border-0">
                  <Sparkles className="h-3 w-3" /> Interactif
                </Badge>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <FavoriteHeart slug={story.slug} />
            </span>
          </div>
          <div>
            <h3
              className={cn(
                "font-serif leading-[1.05] text-white drop-shadow-sm",
                size === "sm" ? "text-xl" : "text-2xl md:text-[1.75rem]"
              )}
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'wght' 500" }}
            >
              {storyTitle(story, locale)}
            </h3>
          </div>
        </div>
        {/* Paper-texture tint on hover */}
        <div className="absolute inset-0 bg-[var(--color-ink-900)]/0 group-hover:bg-[var(--color-ink-900)]/10 transition-colors pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Summary visible enough to judge the story (#18) */}
        <p className="text-sm text-[var(--color-ink-500)] leading-relaxed line-clamp-4">
          {storyExcerpt(story, locale)}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-ink-400)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {story.readingMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star
              className={cn(
                "h-3.5 w-3.5",
                story.ratingCount > 0
                  ? "fill-[var(--color-fox-500)] text-[var(--color-fox-500)]"
                  : "text-[var(--color-ink-300)]"
              )}
            />
            {story.ratingCount > 0
              ? `${story.rating.toFixed(1)} (${story.ratingCount})`
              : "0 note"}
          </span>
        </div>
      </div>
    </Link>
  );
}
