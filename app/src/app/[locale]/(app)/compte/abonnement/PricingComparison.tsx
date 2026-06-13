"use client";

import { useTranslations } from "next-intl";
import { Check, Minus, Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Feature comparison table shown under the three tiers (#10). Lives inside
 * the profile (subscription page). The Max column gets premium styling so
 * the top tier stands out as the most attractive option.
 */
type Cell = boolean | string;

export function PricingComparison() {
  const t = useTranslations("pricing");
  const tc = useTranslations("pricing.compare");

  const unlimited = tc("unlimited");
  const watermark = tc("pdfWatermark");
  const clean = tc("pdfClean");

  // cells order: [free, plus, max]
  const rows: { label: string; cells: [Cell, Cell, Cell] }[] = [
    { label: tc("featLibrary"), cells: [true, true, true] },
    { label: tc("featQuiz"), cells: [true, true, true] },
    { label: tc("featProfiles"), cells: ["1", "3", unlimited] },
    { label: tc("featStories"), cells: ["3", "30", unlimited] },
    { label: tc("featFavorites"), cells: ["30", unlimited, unlimited] },
    { label: tc("featPdf"), cells: [watermark, clean, clean] },
    { label: tc("featEpub"), cells: [false, true, true] },
    { label: tc("featAds"), cells: [false, true, true] },
    { label: tc("featAudio"), cells: [false, true, true] },
    { label: tc("featSleep"), cells: [false, false, true] },
    { label: tc("featMp3"), cells: [false, false, true] },
    { label: tc("featVisual"), cells: [false, false, true] },
    { label: tc("featPrint"), cells: [false, false, true] },
  ];

  const planNames = [t("freeName"), t("plusName"), t("maxName")];

  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl tracking-tight">{tc("title")}</h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-500)]">{tc("subtitle")}</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
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
