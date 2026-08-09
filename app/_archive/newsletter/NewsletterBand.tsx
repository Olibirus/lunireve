import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

/**
 * Pre-footer newsletter band. Ink background, mint accents.
 * Decorative circles/sparkles give it life without motion.
 */
export function NewsletterBand() {
  const t = useTranslations("home.newsletter");

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-[2rem] band-ink text-[var(--color-cream-50)] px-6 md:px-16 py-14 md:py-20">
          {/* Decorative sparkle cluster */}
          <svg
            aria-hidden
            className="absolute -right-8 -top-8 w-64 h-64 opacity-30"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="90" fill="none" stroke="#b7dfcc" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#b7dfcc" strokeWidth="1" strokeDasharray="2 6" />
            <g fill="#b7dfcc">
              <circle cx="100" cy="10" r="2" />
              <circle cx="190" cy="100" r="2" />
              <circle cx="100" cy="190" r="2" />
              <circle cx="10" cy="100" r="2" />
            </g>
          </svg>

          <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-mint-400)]">
                {t("kicker")}
              </p>
              <h2
                className="mt-3 font-serif text-3xl md:text-5xl leading-[1.05] tracking-tight"
                style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
              >
                {t("title")}
              </h2>
              <p className="mt-4 text-[var(--color-indigo-soft-200)] max-w-md leading-relaxed">
                {t("subtitle")}
              </p>

              <ul className="mt-6 space-y-2 text-sm text-[var(--color-indigo-soft-100)]">
                {[t("perk1"), t("perk2"), t("perk3")].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--color-mint-500)]/20 p-1 text-[var(--color-mint-400)]">
                      <Check className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <form className="flex flex-col gap-3 md:pl-8 md:border-l border-[var(--color-ink-700)]">
              <label htmlFor="home-newsletter" className="text-xs uppercase tracking-widest text-[var(--color-mint-400)]">
                {t("formLabel")}
              </label>
              <Input
                id="home-newsletter"
                type="email"
                placeholder={t("placeholder")}
                className="bg-[var(--color-ink-700)] border-[var(--color-ink-600)] text-[var(--color-cream-50)] placeholder:text-[var(--color-indigo-soft-300)] focus:border-[var(--color-mint-400)]"
              />
              <Button variant="mint" size="lg" type="submit" className="w-full justify-center">
                {t("submit")}
              </Button>
              <p className="text-xs text-[var(--color-indigo-soft-300)] leading-relaxed">
                {t("fineprint")}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
