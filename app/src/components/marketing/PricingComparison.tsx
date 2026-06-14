"use client";

import { useTranslations } from "next-intl";
import { Check, Minus, Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TIER_LIMITS } from "@/lib/tier";

/**
 * Feature comparison table shown under the three tiers (#10). Used on both
 * the standalone /tarifs page and the in-profile subscription page. Every
 * numeric/boolean cell is read from TIER_LIMITS so the table can never drift
 * from what the app actually enforces. The Max column gets premium styling.
 */
type Cell = boolean | string;

export function PricingComparison() {
  const t = useTranslations("pricing");
  const tc = useTranslations("pricing.compare");

  const L = TIER_LIMITS;
  const num = (n: number) => (Number.isFinite(n) ? String(n) : tc("unlimited"));
  // 0 of a countable feature renders as a dash, not "0".
  const count = (n: number): Cell => (n > 0 ? num(n) : false);

  // cells order: [free, plus, max]
  const rows: { label: string; cells: [Cell, Cell, Cell] }[] = [
    { label: tc("featLibrary"), cells: [true, true, true] },
    { label: tc("featQuiz"), cells: [true, true, true] },
    {
      label: tc("featProfiles"),
      cells: [num(L.free.profiles), num(L.plus.profiles), num(L.max.profiles)],
    },
    {
      label: tc("featStories"),
      cells: [
        num(L.free.customPerMonth),
        num(L.plus.customPerMonth),
        num(L.max.customPerMonth),
      ],
    },
    {
      label: tc("featFavorites"),
      cells: [num(L.free.favorites), num(L.plus.favorites), num(L.max.favorites)],
    },
    {
      label: tc("featPdf"),
      cells: [tc("pdfWatermark"), tc("pdfClean"), tc("pdfUnbranded")],
    },
    { label: tc("featEpub"), cells: [L.free.epub, L.plus.epub, L.max.epub] },
    { label: tc("featAds"), cells: [L.free.adFree, L.plus.adFree, L.max.adFree] },
    {
      label: tc("featAudio"),
      cells: [L.free.advancedAudio, L.plus.advancedAudio, L.max.advancedAudio],
    },
    { label: tc("featSleep"), cells: [tc("sleepFree"), tc("sleepPaid"), tc("sleepPaid")] },
    {
      label: tc("featMp3"),
      cells: [count(L.free.mp3PerMonth), count(L.plus.mp3PerMonth), count(L.max.mp3PerMonth)],
    },
    {
      label: tc("featVisual"),
      cells: [
        count(L.free.visualBooksPerMonth),
        count(L.plus.visualBooksPerMonth),
        count(L.max.visualBooksPerMonth),
      ],
    },
    {
      label: tc("featPrint"),
      cells: [
        L.free.printDiscountPct ? `${L.free.printDiscountPct}%` : false,
        `${L.plus.printDiscountPct}%`,
        `${L.max.printDiscountPct}%`,
      ],
    },
    {
      label: tc("featCommercial"),
      cells: [L.free.commercialUse, L.plus.commercialUse, L.max.commercialUse],
    },
  ];

  const planNames = [t("freeName"), t("plusName"), t("maxName")];

  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl tracking-tight">{tc("title")}</h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{tc("subtitle")}</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-2/5 px-4 py-3 text-left font-normal text-[var(--color-ink-400)]">
                <span className="sr-only">{tc("featureColumn")}</span>
              </th>
              {planNames.map((name, i) => {
                const isMax = i === 2;
                const isPlus = i === 1;
                return (
                  <th
                    key={name}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-center align-bottom font-serif text-lg tracking-tight",
                      isMax
                        ? "rounded-t-2xl band-ink text-[var(--color-cream-50)]"
                        : "text-[var(--color-ink-800)]"
                    )}
                  >
                    {isMax && (
                      <span className="mb-1.5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mint-400)]">
                        <Crown className="h-3 w-3" />
                        {tc("premiumBadge")}
                      </span>
                    )}
                    {isPlus && (
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-mint-700)]">
                        {t("popular")}
                      </span>
                    )}
                    {name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={row.label}
                className={rowIdx % 2 === 1 ? "bg-[var(--color-cream-50)]" : undefined}
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-normal text-[var(--color-ink-600)]"
                >
                  {row.label}
                </th>
                {row.cells.map((cell, colIdx) => {
                  const isMax = colIdx === 2;
                  return (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-4 py-3 text-center",
                        isMax && "band-ink text-[var(--color-cream-50)]",
                        isMax && rowIdx === rows.length - 1 && "rounded-b-2xl"
                      )}
                    >
                      {typeof cell === "string" ? (
                        <span className={isMax ? "font-medium" : "text-[var(--color-ink-700)]"}>
                          {cell}
                        </span>
                      ) : cell ? (
                        <Check
                          className={cn(
                            "mx-auto h-4 w-4",
                            isMax ? "text-[var(--color-mint-400)]" : "text-[var(--color-mint-600)]"
                          )}
                          aria-label={tc("included")}
                        />
                      ) : (
                        <Minus
                          className={cn(
                            "mx-auto h-4 w-4",
                            isMax ? "text-[var(--color-indigo-soft-300)]" : "text-[var(--color-ink-200)]"
                          )}
                          aria-label={tc("notIncluded")}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
