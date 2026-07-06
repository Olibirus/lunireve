"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AGE_RANGES, ageLabel } from "@/data/mock-stories";
import { SectionStars } from "@/components/marketing/SectionStars";
import { cn } from "@/lib/utils/cn";

/**
 * Age cards (homepage): 6 ROUND cards on 2 rows of 3, one per age range,
 * linking to that age's filtered library. All visible at once, so no arrows
 * or dragging. Assets drop in at /img/ages/<range>.png and appear
 * automatically over the gradient placeholder.
 */
const AGE_COVER: Record<string, string> = {
  "1-2": "cover-mint",
  "3-4": "cover-peach",
  "5-6": "cover-meadow",
  "7-8": "cover-sea",
  "9-10": "cover-indigo",
  "11-12": "cover-night",
};

export function AgeGrid() {
  const t = useTranslations("homeV2");

  return (
    <section className="relative isolate overflow-hidden py-14 md:py-20">
      <SectionStars offset={4} />
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="text-center">
          <h2
            className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.05]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("byAgeTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
            {t("byAgeSubtitle")}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-6 md:gap-10">
          {AGE_RANGES.map((r) => (
            <Link
              key={r}
              href={{ pathname: "/histoires/age/[range]", params: { range: r } }}
              className="group flex flex-col items-center gap-3"
            >
              {/* Round image placeholder — real asset: /img/ages/<range>.png */}
              <div
                className={cn(
                  AGE_COVER[r],
                  "relative aspect-square w-full max-w-[15rem] overflow-hidden rounded-full border-4 border-[var(--color-cream-50)] shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:scale-105"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/ages/${r}.png`}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span
                className="font-serif text-xl md:text-2xl tracking-tight text-[var(--color-ink-800)] group-hover:text-[var(--color-indigo-soft-600)] transition-colors"
                style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
              >
                {ageLabel(r)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
