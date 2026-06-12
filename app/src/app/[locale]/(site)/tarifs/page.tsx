import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Metadata } from "next";

/**
 * Pricing (feedback #9). V1 = free tier live; Plus and Max are displayed
 * with "coming soon" CTAs until Stripe lands (V2). Prices follow the
 * validated draft: Free / Plus 4,99 / Max 9,99 with annual = 2 months off.
 */
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");

  const plans = [
    {
      key: "free",
      highlight: false,
      price: t("freePrice"),
      perks: ["freePerk1", "freePerk2", "freePerk3", "freePerk4", "freePerk5"],
      cta: t("freeCta"),
      available: true,
    },
    {
      key: "plus",
      highlight: true,
      price: t("plusPrice"),
      perks: ["plusPerk1", "plusPerk2", "plusPerk3", "plusPerk4", "plusPerk5"],
      cta: t("comingSoon"),
      available: false,
    },
    {
      key: "max",
      highlight: false,
      price: t("maxPrice"),
      perks: ["maxPerk1", "maxPerk2", "maxPerk3", "maxPerk4", "maxPerk5"],
      cta: t("comingSoon"),
      available: false,
    },
  ] as const;

  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-indigo-soft-600)] sparkle">
            {t("kicker")}
          </p>
          <h1
            className="mx-auto mt-3 max-w-2xl text-4xl md:text-6xl font-serif leading-[1.04] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
          >
            {t.rich("title", {
              accent: (chunks) => <span className="squiggle">{chunks}</span>,
            })}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--color-ink-500)] leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 pb-20">
        <div className="grid gap-6 md:grid-cols-3 md:items-start">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className={cn(
                "rounded-[2rem] border p-7 md:p-8",
                plan.highlight
                  ? "band-ink text-[var(--color-cream-50)] border-transparent md:-mt-4 md:pb-12 shadow-[var(--shadow-float)]"
                  : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)] shadow-[var(--shadow-soft)]"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight">{t(`${plan.key}Name`)}</h2>
                {plan.highlight && (
                  <Badge variant="mint">
                    <Sparkles className="h-3 w-3" />
                    {t("popular")}
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  "mt-1 text-sm",
                  plan.highlight ? "text-[var(--color-indigo-soft-200)]" : "text-[var(--color-ink-500)]"
                )}
              >
                {t(`${plan.key}Tagline`)}
              </p>

              <p className="mt-6 font-serif text-4xl tracking-tight">
                {plan.price}
                <span
                  className={cn(
                    "ml-1 text-sm font-sans",
                    plan.highlight ? "text-[var(--color-indigo-soft-200)]" : "text-[var(--color-ink-400)]"
                  )}
                >
                  {plan.key === "free" ? "" : t("perMonth")}
                </span>
              </p>
              {plan.key !== "free" && (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    plan.highlight ? "text-[var(--color-indigo-soft-300)]" : "text-[var(--color-ink-400)]"
                  )}
                >
                  {t("annualNote")}
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
                  <Link href="/profils">{plan.cta}</Link>
                </Button>
              ) : (
                <Button
                  variant={plan.highlight ? "mint" : "outline"}
                  size="lg"
                  disabled
                  className="mt-8 w-full justify-center"
                >
                  {plan.cta}
                </Button>
              )}
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-[var(--color-ink-400)]">
          {t("fineprint")}
        </p>
      </section>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return { title: t("kicker"), description: t("subtitle") };
}
