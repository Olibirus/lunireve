"use client";

import { useTranslations } from "next-intl";
import { PricingPlans } from "@/components/marketing/PricingPlans";

/**
 * In-profile subscription (#9) — the upgrade is managed inside the profile,
 * not by sending the user to the public pricing page. Reuses PricingPlans
 * with internal CTAs.
 */
export default function SubscriptionPage() {
  const t = useTranslations("account");
  const tp = useTranslations("pricing");

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("menu.plan")}</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{tp("subtitle")}</p>
      <div className="mt-8">
        <PricingPlans internal />
      </div>
      <p className="mt-8 max-w-xl text-xs text-[var(--color-ink-400)]">{tp("fineprint")}</p>
    </div>
  );
}
