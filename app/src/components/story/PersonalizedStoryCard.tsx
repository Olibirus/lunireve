"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Wand2, ArrowRight } from "lucide-react";

/**
 * Personalized-story promo card. Same grid footprint as a StoryCard but a
 * deliberately eye-catching look so parents notice and click it. The whole
 * card is a link to the creation flow. Uses fixed colors (not theme tokens)
 * so it stays readable and on-brand in both light and dark mode.
 */
export function PersonalizedStoryCard() {
  const t = useTranslations("personalizedCard");

  return (
    <Link
      href="/creer"
      className="group relative flex min-h-[20rem] flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-center shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02]"
      style={{
        background: "linear-gradient(155deg, #1f2d52 0%, #2c3a66 55%, #3b4a7a 100%)",
        color: "#faf5eb",
      }}
    >
      {/* Soft decorative glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(183,223,204,0.35) 0%, transparent 70%)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,143,193,0.30) 0%, transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "#b7dfcc", color: "#17224a" }}
        >
          <Wand2 className="h-7 w-7" />
        </span>
        <span
          className="mt-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: "rgba(183,223,204,0.18)", color: "#b7dfcc" }}
        >
          {t("badge")}
        </span>
        {/* Explicit cream: the global h3 rule paints ink-800, which is
            near-invisible on this navy card in light mode */}
        <h3
          className="mt-3 font-serif text-2xl leading-[1.12] tracking-tight md:text-[1.7rem]"
          style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500", color: "#faf5eb" }}
        >
          {t("title")}
        </h3>
        <p className="mt-3 max-w-[18rem] text-[0.95rem] leading-relaxed" style={{ color: "#cfd5ec" }}>
          {t("body")}
        </p>
        <span
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors"
          style={{ background: "#b7dfcc", color: "#17224a" }}
        >
          {t("cta")}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
