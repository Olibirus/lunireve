"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * 1–5 star rating. One rating per visitor per story (localStorage in Phase 1,
 * per child profile in Batch 5). The public average shown next to the picker
 * is the mock `rating` until real aggregates exist.
 *
 * Anti-abuse (brief §8): once accounts are live, rating requires a verified
 * account that read ≥50% of the story — enforced server-side in Phase 2.
 */
export function RatingStars({
  slug,
  average,
}: {
  slug: string;
  average: number;
}) {
  const t = useTranslations("story");
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const key = `lunireve:rating:${slug}`;

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setMine(Number(stored));
  }, [key]);

  function rate(value: number) {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* non-fatal */
    }
    setMine(value);
  }

  const shown = hover ?? mine ?? 0;

  return (
    <div className="rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-6 text-center">
      <h3 className="font-serif text-lg tracking-tight">{t("rateTitle")}</h3>
      <div
        className="mt-3 flex justify-center gap-1"
        role="radiogroup"
        aria-label={t("rateTitle")}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={mine === v}
            aria-label={`${v}/5`}
            onClick={() => rate(v)}
            onMouseEnter={() => setHover(v)}
            className="p-1"
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                v <= shown
                  ? "fill-[var(--color-fox-500)] text-[var(--color-fox-500)]"
                  : "text-[var(--color-ink-200)]"
              )}
            />
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--color-ink-500)]">
        {mine !== null
          ? t("rateThanks", { rating: mine })
          : t("rateAverage", { average: average.toFixed(1) })}
      </p>
    </div>
  );
}
