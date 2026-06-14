import { setRequestLocale, getTranslations } from "next-intl/server";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { PromoBanner } from "@/components/marketing/PromoBanner";
import type { Metadata } from "next";

/**
 * Pricing page. Free tier live; Plus/Max "coming soon" until Stripe (V2).
 * Monthly/annual toggle (default annual) lives in <PricingPlans /> (#22).
 */
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");

  return (
    <>
      <PromoBanner />
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
        <PricingPlans />
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
