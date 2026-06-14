"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isPromoActive, promoPrice, promoEndLabel, SUMMER_PROMO } from "@/lib/promo";

/**
 * Pricing plans with a monthly/annual toggle (#22). Default = annual
 * (2 months free). Annual shows the monthly-equivalent price + the yearly
 * total. Used on /tarifs and inside the parent profile.
 *
 * @param internal when true, CTAs stay inside the profile (no external
 *        links) — the upgrade is "managed within the profile" (#9).
 */
export function PricingPlans({ internal = false }: { internal?: boolean }) {
  const t = useTranslations("pricing");
  const tPromo = useTranslations("promo");
  const locale = useLocale();
  const [annual, setAnnual] = useState(true);
  const promo = isPromoActive();
  const euro = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

  // Monthly base prices (€). Annual = 10 months (2 free).
  const plans = [
    {
      key: "free",
      monthly: 0,
      highlight: false,
      perks: ["freePerk1", "freePerk2", "freePerk3", "freePerk4", "freePerk5"],
      available: true,
    },
    {
      key: "plus",
      monthly: 4.99,
      highlight: true,
      perks: ["plusPerk1", "plusPerk2", "plusPerk3", "plusPerk4", "plusPerk5"],
      available: false,
    },
    {
      key: "max",
      monthly: 9.99,
      highlight: false,
      perks: ["maxPerk1", "maxPerk2", "maxPerk3", "maxPerk4", "maxPerk5"],
      available: false,
    },
  ] as const;

  function priceLabel(monthly: number) {
    if (monthly === 0) return { big: t("freePrice"), sub: "", original: "" };
    const base = annual ? (monthly * 10) / 12 : monthly;
    const sub = annual
      ? t("billedAnnually", {
          total: euro(promo ? promoPrice(monthly * 10) : monthly * 10),
        })
      : t("perMonth");
    if (promo) {
      return { big: euro(promoPrice(base)), sub, original: euro(base) };
    }
    return { big: euro(base), sub, original: "" };
  }

  return (
    <div>
      {/* Summer promo callout (auto-applied 50% off the first payment) */}
      {promo && (
        <div className="mb-8 flex flex-col items-center gap-2 rounded-3xl border border-[var(--color-mint-300)] bg-[var(--color-mint-100)] p-5 text-center md:flex-row md:justify-center md:gap-4">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-mint-500)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17224a]">
            <Tag className="h-3.5 w-3.5" />
            {tPromo("calloutTitle", { percent: SUMMER_PROMO.percent })}
          </span>
          <p className="max-w-2xl text-sm text-[var(--color-ink-700)]">
            {tPromo("calloutBody", { percent: SUMMER_PROMO.percent, date: promoEndLabel(locale) })}
          </p>
        </div>
      )}

      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex items-center rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-1">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              !annual ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]" : "text-[var(--color-ink-600)]"
            )}
          >
            {t("monthly")}
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
              annual ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]" : "text-[var(--color-ink-600)]"
            )}
          >
            {t("annual")}
            <span className="rounded-full bg-[var(--color-mint-400)] px-2 py-0.5 text-[10px] font-bold text-[#17224a]">
              {t("twoMonthsFree")}
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:items-start">
        {plans.map((plan) => {
          const price = priceLabel(plan.monthly);
          return (
            <article
              key={plan.key}
              className={cn(
                "rounded-[2rem] border p-7 md:p-8",
                plan.highlight
                  ? "band-ink text-[var(--color-cream-50)] border-transparent md:-mt-4 md:pb-12 shadow-[var(--shadow-float)]"
                  : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-2xl tracking-tight">{t(`${plan.key}Name`)}</h2>
                <span className="flex shrink-0 items-center gap-1.5">
                  {promo && plan.monthly > 0 && (
                    <Badge variant="fox">
                      <Tag className="h-3 w-3" />
                      {tPromo("badge", { percent: SUMMER_PROMO.percent })}
                    </Badge>
                  )}
                  {plan.highlight && (
                    <Badge variant="mint">
                      <Sparkles className="h-3 w-3" />
                      {t("popular")}
                    </Badge>
                  )}
                </span>
              </div>
              <p className={cn("mt-1 text-sm", plan.highlight ? "text-[var(--color-indigo-soft-200)]" : "text-[var(--color-ink-500)]")}>
                {t(`${plan.key}Tagline`)}
              </p>

              {price.original && (
                <p className={cn("mt-6 text-sm line-through", plan.highlight ? "text-[var(--color-indigo-soft-300)]" : "text-[var(--color-ink-400)]")}>
                  {tPromo("wasPrice", { price: price.original })}
                </p>
              )}
              <p className={cn("font-serif text-4xl tracking-tight", price.original ? "mt-1" : "mt-6")}>{price.big}</p>
              {price.sub && (
                <p className={cn("mt-1 text-xs", plan.highlight ? "text-[var(--color-indigo-soft-300)]" : "text-[var(--color-ink-400)]")}>
                  {price.sub}
                </p>
              )}
              {promo && plan.monthly > 0 && (
                <p className={cn("mt-1.5 text-xs font-medium", plan.highlight ? "text-[var(--color-mint-400)]" : "text-[var(--color-mint-700)]")}>
                  {tPromo("firstPaymentNote", { percent: SUMMER_PROMO.percent })}
                </p>
              )}

              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 rounded-full p-0.5",
                        plan.highlight
                          ? "bg-[var(--color-mint-500)]/25 text-[var(--color-mint-400)]"
                          : "bg-[var(--color-mint-100)] text-[var(--color-mint-700)]"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    {t(perk)}
                  </li>
                ))}
              </ul>

              {plan.available ? (
                <Button asChild variant={plan.highlight ? "mint" : "primary"} size="lg" className="mt-8 w-full justify-center">
                  <Link href={internal ? "/compte" : "/profils"}>{t("freeCta")}</Link>
                </Button>
              ) : (
                <Button variant={plan.highlight ? "mint" : "outline"} size="lg" disabled className="mt-8 w-full justify-center">
                  {t("comingSoon")}
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
