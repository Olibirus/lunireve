import { useTranslations } from "next-intl";
import { BookOpen, Wand2, BookHeart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * How it works — a 3-step journey that makes the model unambiguous:
 * 1. read for free (the open, free heart of Lunireve),
 * 2. personalize (the paid upgrade),
 * 3. print the keepsake book (premium, coming soon).
 * Each step carries an explicit price badge so no one confuses free with paid.
 */
export function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  const steps = [
    {
      n: "01",
      icon: BookOpen,
      title: "step1Title",
      desc: "step1Desc",
      badge: "freeBadge",
      badgeClass: "bg-[var(--color-mint-200)] text-[var(--color-mint-800)]",
    },
    {
      n: "02",
      icon: Wand2,
      title: "step2Title",
      desc: "step2Desc",
      badge: "paidBadge",
      badgeClass: "bg-[var(--color-indigo-soft-100)] text-[var(--color-indigo-soft-700)]",
    },
    {
      n: "03",
      icon: BookHeart,
      title: "step3Title",
      desc: "step3Desc",
      badge: "soonBadge",
      badgeClass: "bg-[var(--color-fox-300)]/30 text-[var(--color-fox-700)]",
    },
  ] as const;

  return (
    <section className="bg-[var(--color-cream-100)]">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("kicker")}
          </p>
          <h2
            className="mx-auto mt-3 max-w-2xl text-3xl md:text-5xl tracking-tight font-serif leading-[1.05]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-ink-500)] leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.n}
                className="relative rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-7 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-2xl bg-[var(--color-cream-100)] p-2.5">
                    <Icon className="h-5 w-5 text-[var(--color-indigo-soft-600)]" />
                  </span>
                  <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest", s.badgeClass)}>
                    {t(s.badge)}
                  </span>
                </div>
                <h3
                  className="mt-6 font-serif text-[1.5rem] leading-[1.15] tracking-tight"
                  style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 500" }}
                >
                  {t(s.title)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-500)]">
                  {t(s.desc)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
