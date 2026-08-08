"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { OCCASION_PRESETS, SITUATION_PRESETS } from "@/lib/storyOptions";
import { SectionStars } from "@/components/marketing/SectionStars";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Main-themes carousel (homepage, right after the "create their story" CTA):
 * the life situations parents most often want a story about (fear, birthday,
 * new baby, big tantrums...). Same visual language as the genre carousel:
 * square image-placeholder cards, infinite loop, draggable, arrows.
 *
 * Each card opens the personalized-story wizard with that theme pre-applied
 * (/creer?occasion=<id>), because these emotional themes are best served by a
 * story starring the child. Real art drops in at /img/themes/<id>.png.
 */

/** Curated subset of the presets, the "main themes" for the homepage. */
const THEME_IDS = [
  "nuit-sans-peur",
  "grosses-coleres",
  "anniversaire",
  "nouveau-bebe",
  "rentree",
  "dispute-fratrie",
  "peur-docteur",
  "demenagement",
  "velo",
] as const;

const THEME_COVER: Record<string, string> = {
  "nuit-sans-peur": "cover-night",
  "grosses-coleres": "cover-peach",
  anniversaire: "cover-sand",
  "nouveau-bebe": "cover-mint",
  rentree: "cover-indigo",
  "dispute-fratrie": "cover-meadow",
  "peur-docteur": "cover-sea",
  demenagement: "cover-dusk",
  velo: "cover-sand",
};

const ALL = [...OCCASION_PRESETS, ...SITUATION_PRESETS];
const THEMES = THEME_IDS.map((id) => ALL.find((p) => p.id === id)!).filter(Boolean);
const N = THEMES.length;

export function ThemeCarousel() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [perView, setPerView] = useState(4);
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

  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  const step = 100 / perView;

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

  const offset =
    -(index * step) +
    (drag && trackRef.current
      ? (drag.dx / (trackRef.current.parentElement?.clientWidth ?? 1)) * 100
      : 0);

  const tripled = [...THEMES, ...THEMES, ...THEMES];

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
              {t("homeV2.byThemeTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
              {t("homeV2.byThemeSubtitle")}
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

        <div className="mt-6 overflow-hidden py-6">
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
            {tripled.map((theme, i) => (
              <div key={`${theme.id}-${i}`} className="shrink-0 px-2 md:px-3" style={{ width: `${step}%` }}>
                <button
                  type="button"
                  className="group block w-full text-left"
                  onClick={() => {
                    if (moved.current) return;
                    // Public library filtered on this theme: no login wall.
                    // (Creating a personalized story on this theme stays one
                    // tap away from the library's "create" CTA.)
                    router.push({ pathname: "/histoires", query: { theme: theme.theme } });
                  }}
                >
                  {/* Square theme illustration (/img/themes/<id>.webp) */}
                  <div
                    className={cn(
                      THEME_COVER[theme.id] ?? "cover-indigo",
                      "relative aspect-square w-full overflow-hidden rounded-3xl border border-[var(--color-ink-100)] shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:scale-[1.04]"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/img/themes/${theme.id}.webp`}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  {/* Title below the card */}
                  <span
                    className="mt-3 block text-center font-serif text-lg md:text-xl leading-tight tracking-tight text-[var(--color-ink-800)] transition-colors group-hover:text-[var(--color-indigo-soft-600)]"
                    style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                  >
                    {locale === "en" ? theme.en : theme.fr}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
