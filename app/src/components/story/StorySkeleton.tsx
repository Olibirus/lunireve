/**
 * Shimmer skeletons for loading states (YouTube-style). `.skeleton` carries the
 * animated shine (see globals.css). Used by route-level loading.tsx files.
 */

export function StoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="space-y-2.5 p-5">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-5/6 rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="mt-4 flex gap-4">
          <div className="skeleton h-3 w-12 rounded-full" />
          <div className="skeleton h-3 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StoryGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
