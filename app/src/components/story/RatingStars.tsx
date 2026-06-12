"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { isLoggedIn } from "@/lib/clientAuth";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * 1–5 star rating. Requires an account (item #3): logged-out visitors see a
 * create-account prompt when they try to rate. Shows REAL aggregates only
 * (item #22) — "0 note" until actual ratings exist.
 *
 * Phase 2: rating posts to the API (verified account + ≥50% read,
 * one per profile per story) and aggregates come from SQL.
 */
export function RatingStars({
  slug,
  average,
  count,
}: {
  slug: string;
  average: number;
  count: number;
}) {
  const t = useTranslations("story");
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [logged, setLogged] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const key = `lunireve:rating:${slug}`;

  useEffect(() => {
    setLogged(isLoggedIn());
    const stored = localStorage.getItem(key);
    if (stored) setMine(Number(stored));
  }, [key]);

  function rate(value: number) {
    if (!logged) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* non-fatal */
    }
    setMine(value);
    setShowLoginPrompt(false);
  }

  const shown = hover ?? mine ?? 0;

  return (
    <div className="text-center">
      <h3 className="font-serif text-lg tracking-tight">{t("rateTitle")}</h3>
      <div
        className="mt-3 flex justify-center gap-1"
        role="radiogroup"
        aria-label={t("rateTitle")}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={mine === v}
            aria-label={`${v}/5`}
            onClick={() => rate(v)}
            onMouseEnter={() => setHover(v)}
            className="p-1"
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                v <= shown
                  ? "fill-[var(--color-fox-500)] text-[var(--color-fox-500)]"
                  : "text-[var(--color-ink-200)]"
              )}
            />
          </button>
        ))}
      </div>

      {showLoginPrompt && !logged ? (
        <p className="mt-3 rounded-xl bg-[var(--color-mint-100)] px-4 py-2.5 text-sm text-[var(--color-ink-700)]">
          {t("rateLoginPrompt")}{" "}
          <Link href="/connexion" className="font-medium underline underline-offset-2">
            {t("rateLoginCta")}
          </Link>
        </p>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-ink-500)]">
          {mine !== null
            ? t("rateThanks", { rating: mine })
            : count > 0
            ? t("rateAverage", { average: average.toFixed(1), count })
            : t("rateNone")}
        </p>
      )}
    </div>
  );
}
