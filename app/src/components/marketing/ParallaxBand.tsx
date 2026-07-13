"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Full-width parallax band: the image is oversized and translates at a
 * fraction of the scroll speed (rAF-driven), which reads as depth. Text sits
 * on a strong scrim + soft text shadow so it stays readable over any part of
 * the photo, in light and dark mode alike. Reduced-motion gets a static image.
 */
export function ParallaxBand() {
  const t = useTranslations("homeV2");
  const ref = useRef<HTMLElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // -1 (below viewport) .. 1 (above viewport)
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        setShift(Math.max(-1, Math.min(1, progress)) * -12); // percent of extra height
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex h-[46vh] min-h-[320px] md:h-[64vh] items-center justify-center overflow-hidden"
    >
      {/* Oversized image layer moving slower than the page = depth */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-[15%] h-[130%] bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: "url(/img/website/homepage-parallax.jpg)",
          transform: `translateY(${shift}%)`,
        }}
      />
      {/* Readability scrim: radial focus + overall darkening, both modes */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10, 16, 38, 0.62) 0%, rgba(10, 16, 38, 0.42) 55%, rgba(10, 16, 38, 0.5) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center text-white">
        {/* text-white on the h2 itself: the global heading rule paints it
            ink-800 otherwise, navy-on-navy in light mode */}
        <h2
          className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.08] text-white"
          style={{
            fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500",
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          {t("parallaxTitle")}
        </h2>
        <p
          className="mx-auto mt-4 max-w-xl leading-relaxed text-white/95"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
        >
          {t("parallaxBody")}
        </p>
      </div>
    </section>
  );
}
