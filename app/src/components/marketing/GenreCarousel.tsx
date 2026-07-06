"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GENRES } from "@/data/mock-stories";
import { SectionStars } from "@/components/marketing/SectionStars";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Genre cards carousel (homepage): square image-placeholder cards, one per
 * genre, linking to that genre's filtered library. Infinite (wraps around
 * seamlessly via a tripled track), draggable, with prev/next arrows that
 * slide one card at a time. 4 cards visible on desktop, 3 on tablet, 2 on
 * mobile. Assets drop in at /img/genres/<genre>.png and appear automatically.
 */
const N = GENRES.length;

/** Gradient placeholders until the real genre artwork lands. */
const GENRE_COVER: Record<string, string> = {
  conte: "cover-dusk",
  aventure: "cover-meadow",
  fete: "cover-peach",
  mystere: "cover-night",
  "science-fiction": "cover-indigo",
  educative: "cover-mint",
  fantastique: "cover-sea",
  rigolote: "cover-sand",
  metier: "cover-meadow",
};

export function GenreCarousel() {
  const t = useTranslations();
  const router = useRouter();

  const [perView, setPerView] = useState(4);
  // Index into the tripled track; start on the middle copy.
  const [index, setIndex] = useState<number>(N);
  const [animate, setAnimate] = useState(true);
  const [drag, setDrag] = useState<{ startX: number; dx: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    const compute = () =>
      setPerView(window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // After sliding into an outer copy, snap back to the middle copy without
  // animation so the loop feels endless (never a visible reset).
  function onTransitionEnd() {
    setIndex((i) => {
      if (i >= 2 * N) {
        setAnimate(false);
        return i - N;
      }
      if (i < N) {
        setAnimate(false);
        return i + N;
      }
      return i;
    });
  }

  // Re-enable animation right after a silent snap.
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  const step = 100 / perView; // one card, in % of the viewport strip

  function onPointerDown(e: React.PointerEvent) {
    moved.current = false;
    setDrag({ startX: e.clientX, dx: 0 });
  }
  function onPointerMove(e: React.PointerEvent) {
    setDrag((d) => {
      if (!d) return d;
      const dx = e.clientX - d.startX;
      if (Math.abs(dx) > 6) moved.current = true;
      return { ...d, dx };
    });
  }
  function onPointerUp() {
    setDrag((d) => {
      if (d && trackRef.current) {
        const width = trackRef.current.parentElement?.clientWidth ?? 1;
        const cards = Math.round((-d.dx / width) * perView);
        if (cards !== 0) setIndex((i) => i + cards);
      }
      return null;
    });
  }

  const offset = -(index * step) + (drag && trackRef.current
    ? (drag.dx / (trackRef.current.parentElement?.clientWidth ?? 1)) * 100
    : 0);

  const tripled = [...GENRES, ...GENRES, ...GENRES];

  return (
    <section className="relative isolate overflow-hidden py-14 md:py-20">
      <SectionStars />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.05]"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
            >
              {t("homeV2.byGenreTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
              {t("homeV2.byGenreSubtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("library.prev")}
              onClick={() => setIndex((i) => i - 1)}
              className="rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2.5 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={t("library.next")}
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2.5 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewport (margins on both sides come from the max-w container) */}
        <div className="mt-8 overflow-hidden">
          <div
            ref={trackRef}
            className={cn("drag-x flex", drag && "dragging")}
            style={{
              transform: `translateX(${offset}%)`,
              transition: animate && !drag ? "transform 0.45s cubic-bezier(0.25, 1, 0.4, 1)" : "none",
            }}
            onTransitionEnd={onTransitionEnd}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {tripled.map((g, i) => (
              <div key={`${g}-${i}`} className="shrink-0 px-2 md:px-3" style={{ width: `${step}%` }}>
                <button
                  type="button"
                  className="group block w-full text-left"
                  onClick={() => {
                    if (moved.current) return; // it was a drag, not a click
                    router.push({ pathname: "/histoires/genre/[genre]", params: { genre: g } });
                  }}
                >
                  {/* Square image placeholder — real asset: /img/genres/<g>.png */}
                  <div
                    className={cn(
                      GENRE_COVER[g] ?? "cover-indigo",
                      "relative aspect-square w-full overflow-hidden rounded-3xl border border-[var(--color-ink-100)] shadow-[var(--shadow-soft)] transition-transform group-hover:scale-[1.03]"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/img/genres/${g}.png`}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <span
                      className="absolute inset-x-0 bottom-0 p-4 font-serif text-lg md:text-xl leading-tight text-white drop-shadow"
                      style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                    >
                      {t(`genres.${g}`)}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
