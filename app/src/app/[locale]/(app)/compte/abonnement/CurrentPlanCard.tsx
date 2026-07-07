"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { readTier, type Tier } from "@/lib/tier";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * "Current plan" band at the top of /compte/abonnement. Shows the tier the
 * account is on, an upgrade CTA (scrolling to the plans grid below, or the
 * downgrade prompt for Max users), and a cancel CTA that opens a confirmation
 * dialog. V1 has no billing yet, so cancel is informational and free users are
 * simply told there is nothing to cancel.
 */
export function CurrentPlanCard() {
  const t = useTranslations("account.currentPlan");
  const tp = useTranslations("pricing");
  const [tier, setTier] = useState<Tier | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    setTier(readTier());
  }, []);

  if (tier === null) return null;

  const isFree = tier === "free";
  const isMax = tier === "max";
  const planName = tp(`${tier}Name`);

  function scrollToPlans() {
    document
      .getElementById("plans-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      className={cn(
        "rounded-3xl border p-6 md:p-8 shadow-[var(--shadow-soft)]",
        isMax
          ? "band-ink text-[var(--color-cream-50)] border-transparent"
          : "border-[var(--color-ink-100)] bg-[var(--color-cream-50)]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p
            className={cn(
              "text-xs uppercase tracking-widest",
              isMax ? "text-[var(--color-mint-400)]" : "text-[var(--color-indigo-soft-600)]"
            )}
          >
            {t("kicker")}
          </p>
          <h2 className="mt-1 font-serif text-2xl md:text-3xl tracking-tight flex items-center gap-2">
            {planName}
            <CheckCircle2
              className={cn(
                "h-5 w-5",
                isMax ? "text-[var(--color-mint-400)]" : "text-[var(--color-mint-600)]"
              )}
            />
          </h2>
          <p
            className={cn(
              "mt-2 max-w-md text-sm",
              isMax ? "text-[var(--color-indigo-soft-200)]" : "text-[var(--color-ink-500)]"
            )}
          >
            {tp(`${tier}Tagline`)}
          </p>
          {cancelled && (
            <p className="mt-3 rounded-xl bg-[var(--color-mint-100)] px-3.5 py-2 text-xs text-[var(--color-ink-700)]">
              {t("cancelledConfirmation")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {!isMax && (
            <Button variant="mint" size="md" onClick={scrollToPlans}>
              <Sparkles className="h-4 w-4" />
              {isFree ? t("upgradeCta") : t("upgradeToMax")}
            </Button>
          )}
          {isFree ? (
            <Button asChild variant="outline" size="md">
              <Link href="/tarifs">{t("comparePlans")}</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => setConfirming(true)}
              className={cn(
                isMax &&
                  "border-[var(--color-indigo-soft-400)] text-[var(--color-cream-50)] hover:bg-white/10"
              )}
            >
              <X className="h-4 w-4" />
              {t("cancelCta")}
            </Button>
          )}
        </div>
      </div>

      {/* Cancel confirmation — inline (V2 will replace this with the Stripe
          "cancel at period end" flow). Free tier has nothing to cancel. */}
      {confirming && (
        <div className="mt-6 rounded-2xl border border-[var(--color-fox-300)] bg-[var(--color-fox-300)]/10 p-4 text-[var(--color-ink-800)]">
          {isFree ? (
            <p className="text-sm">{t("nothingToCancel")}</p>
          ) : (
            <>
              <p className="text-sm">{t("cancelPrompt", { plan: planName })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCancelled(true);
                    setConfirming(false);
                  }}
                >
                  {t("cancelConfirm")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  {t("cancelKeep")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
