import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BookOpen, Sparkles, Wand2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Three-ways grid — the product architecture in one visual beat.
 *
 * Cards are deliberately styled differently:
 * - #1 library: cream card — the "free, always open" tier
 * - #2 personalized text: ink card — the "subscriber" tier, darker/weightier
 * - #3 picture book: mint card — the "premium/craft" tier, most saturated
 *
 * This differentiation does the work of explaining the tier hierarchy
 * before the copy does.
 */
export function ThreeWays() {
  const t = useTranslations("home.threeWays");

  const cards = [
    {
      icon: BookOpen,
      number: "01",
      titleKey: "card1Title",
      descKey: "card1Desc",
      ctaKey: "card1Cta",
      href: "/histoires" as const,
      tone: "cream" as const,
    },
    {
      icon: Wand2,
      number: "02",
      titleKey: "card2Title",
      descKey: "card2Desc",
      ctaKey: "card2Cta",
      href: "/creer" as const,
      tone: "ink" as const,
    },
    {
      icon: Sparkles,
      number: "03",
      titleKey: "card3Title",
      descKey: "card3Desc",
      ctaKey: "card3Cta",
      href: "/creer" as const,
      tone: "mint" as const,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("kicker")}
          </p>
          <h2
            className="mt-3 text-3xl md:text-5xl tracking-tight font-serif max-w-xl leading-[1.05]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("title")}
          </h2>
        </div>
        <p className="text-[var(--color-ink-500)] md:max-w-sm leading-relaxed">{t("subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 lg:gap-7">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const toneStyles =
            c.tone === "cream"
              ? "bg-[var(--color-cream-100)] text-[var(--color-ink-800)] border-[var(--color-cream-200)]"
              : c.tone === "ink"
              ? "band-ink text-[var(--color-cream-50)] border-transparent"
              : "bg-[var(--color-mint-200)] text-[var(--color-ink-800)] border-[var(--color-mint-300)]";
          const mutedStyles =
            c.tone === "ink"
              ? "text-[var(--color-indigo-soft-300)]"
              : "text-[var(--color-ink-500)]";
          const numberStyles =
            c.tone === "ink"
              ? "text-[var(--color-mint-400)]"
              : "text-[var(--color-indigo-soft-500)]";
          const ctaStyles =
            c.tone === "ink"
              ? "border-[var(--color-indigo-soft-600)] text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
              : "border-[var(--color-ink-200)] text-[var(--color-ink-800)] hover:bg-[var(--color-cream-50)]";

          return (
            <article
              key={c.number}
              className={cn(
                "relative rounded-3xl border p-7 md:p-8 flex flex-col",
                toneStyles,
                i === 1 && "md:-mt-6",
                i === 2 && "md:mt-6"
              )}
            >
              <header className="flex items-start justify-between">
                <span
                  className={cn("font-serif text-5xl leading-none tracking-tight", numberStyles)}
                  style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80" }}
                >
                  {c.number}
                </span>
                <span
                  className={cn(
                    "rounded-2xl p-2.5",
                    c.tone === "ink"
                      ? "bg-[var(--color-ink-700)]"
                      : "bg-[var(--color-cream-50)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </header>

              <h3
                className={cn(
                  "mt-8 font-serif text-[1.6rem] leading-[1.15] tracking-tight"
                )}
                style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
              >
                {t(c.titleKey)}
              </h3>
              <p className={cn("mt-3 text-sm leading-relaxed", mutedStyles)}>
                {t(c.descKey)}
              </p>

              <Link
                href={c.href}
                className={cn(
                  "mt-8 inline-flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  ctaStyles
                )}
              >
                {t(c.ctaKey)}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
