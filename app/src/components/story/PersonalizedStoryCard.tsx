"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles, Wand2, ArrowRight } from "lucide-react";

/**
 * Personalized-story promo card. Same grid footprint as a StoryCard but a
 * deliberately different look (dark indigo gradient) so it stands out as a
 * call to action. Identical everywhere it appears (currently injected into the
 * library grid's 2nd row).
 */
export function PersonalizedStoryCard() {
  const t = useTranslations("personalizedCard");

  return (
    <Link
      href="/creer"
      className="group relative flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-indigo-soft-400)] bg-gradient-to-br from-[var(--color-ink-800)] via-[var(--color-ink-700)] to-[var(--color-indigo-soft-600)] p-6 text-[var(--color-cream-50)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-float)]"
    >
      <Sparkles
        aria-hidden
        className="absolute -right-5 -top-5 h-28 w-28 text-[var(--color-mint-400)] opacity-15"
      />
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-400)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#17224a]">
          <Wand2 className="h-3.5 w-3.5" />
          {t("badge")}
        </span>
        <h3
          className="mt-4 font-serif text-2xl leading-[1.1] tracking-tight"
          style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
        >
          {t("title")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-indigo-soft-200)]">
          {t("body")}
        </p>
      </div>
      <span className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-mint-400)] px-5 py-2.5 text-sm font-semibold text-[#17224a] transition-colors group-hover:bg-[var(--color-mint-300)]">
        {t("cta")}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
