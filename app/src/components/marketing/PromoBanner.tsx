"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { isPromoActive, promoEndLabel, SUMMER_PROMO } from "@/lib/promo";
import { Sparkles, X } from "lucide-react";

const KEY = "lunireve:promoDismissed:summer2026";

/**
 * Slim, light promo bar shown at the very top of the homepage and pricing
 * page while the summer offer runs. Dismissible (remembered in localStorage)
 * and self-hiding once the offer ends, so it never lingers.
 */
export function PromoBanner() {
  const t = useTranslations("promo");
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isPromoActive()) return;
    try {
      if (localStorage.getItem(KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="relative bg-[var(--color-mint-200)] text-[var(--color-ink-800)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2.5 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles className="h-4 w-4 text-[var(--color-mint-700)]" />
          {t("bannerText", { percent: SUMMER_PROMO.percent })}
        </span>
        <span className="text-[var(--color-ink-600)]">
          {t("bannerUntil", { date: promoEndLabel(locale) })}
        </span>
        <Link
          href="/tarifs"
          className="rounded-full bg-[var(--color-ink-800)] px-3 py-1 text-xs font-semibold text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] transition-colors"
        >
          {t("bannerCta")}
        </Link>
      </div>
      <button
        type="button"
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(KEY, "1");
          } catch {
            /* ignore */
          }
        }}
        aria-label={t("dismiss")}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-ink-500)] hover:bg-[var(--color-mint-300)] hover:text-[var(--color-ink-800)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
