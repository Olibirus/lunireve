"use client";

import { useTranslations } from "next-intl";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { PricingComparison } from "@/components/marketing/PricingComparison";
import { CurrentPlanCard } from "./CurrentPlanCard";

/**
 * In-profile subscription (#9): current plan up top with upgrade + cancel
 * CTAs, then the plans grid (scroll target #plans-grid) and the comparison
 * table for context.
 */
export default function SubscriptionPage() {
  const t = useTranslations("account");
  const tp = useTranslations("pricing");

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("menu.plan")}</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{tp("subtitle")}</p>

      <div className="mt-6">
        <CurrentPlanCard />
      </div>

      <div id="plans-grid" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl tracking-tight">{t("currentPlan.changePlan")}</h2>
        <div className="mt-6">
          <PricingPlans internal />
        </div>
      </div>

      <PricingComparison />
      <p className="mt-8 max-w-xl text-xs text-[var(--color-ink-400)]">{tp("fineprint")}</p>
    </div>
  );
}
