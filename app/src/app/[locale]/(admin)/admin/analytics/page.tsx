"use client";

import { useState } from "react";
import { Kpi } from "@/components/admin/AdminShell";
import { DATE_RANGES, globalKpis, storyAnalytics } from "@/data/mock-admin";
import { Download, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * FULL analytics (brief: everything measurable, from day 1).
 * Date-range chips re-scale the mock numbers so the UI behaves like the
 * real thing; Phase 2 swaps in SQL aggregates + real Excel/PDF export.
 */
export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>("30");

  // Mock scaling: shorter ranges → proportionally smaller numbers.
  const factor = range === "all" ? 1.6 : Math.min(1, Number(range) / 90);
  const n = (v: number) => Math.round(v * factor).toLocaleString("fr-FR");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">
            Données de démonstration, branchement Umami + SQL au lot n8n.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-3.5 py-2 text-xs hover:bg-[var(--color-cream-100)]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ink-100)] px-3.5 py-2 text-xs hover:bg-[var(--color-cream-100)]"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date ranges */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {DATE_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              range === r
                ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                : "border-[var(--color-ink-100)] text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
            )}
          >
            {r === "all" ? "Tout" : `${r} j`}
          </button>
        ))}
        <span className="rounded-full border border-dashed border-[var(--color-ink-200)] px-3 py-1 text-xs text-[var(--color-ink-400)]">
          Personnalisé, bientôt
        </span>
      </div>

      {/* Audience */}
      <h2 className="mt-8 font-serif text-xl tracking-tight">Audience</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Utilisateurs totaux" value={globalKpis.totalUsers} />
        <Kpi label="Nouveaux comptes" value={n(120)} />
        <Kpi label="Gratuits / payants" value={`${globalKpis.totalUsers} / ${globalKpis.paidUsers}`} hint="Paiement en V2" />
        <Kpi label="Profils enfants" value={globalKpis.childProfiles} />
        <Kpi label="Temps moyen / session" value={`${globalKpis.avgSessionMin} min`} />
        <Kpi label="Conversion compte" value={`${globalKpis.accountConversionPct}%`} hint="visiteurs → inscrits" />
        <Kpi label="Fréquence de visite" value="2,7 / sem." />
        <Kpi label="Inscrits newsletter" value={n(globalKpis.newsletterSignups)} />
      </div>

      {/* Personalization */}
      <h2 className="mt-10 font-serif text-xl tracking-tight">Personnalisation</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Histoires créées" value={n(globalKpis.customStoriesCreated)} />
        <Kpi label="Thème le plus choisi" value={globalKpis.topPersonalizationTheme} />
        <Kpi label="Héros le plus choisi" value="Prénom de l'enfant" />
        <Kpi label="Quota moyen utilisé" value="1,8 / 3" />
      </div>

      {/* Per-story table */}
      <h2 className="mt-10 font-serif text-xl tracking-tight">Par histoire</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-ink-100)] text-left text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              <th className="px-4 py-3 font-medium">Histoire</th>
              <th className="px-4 py-3 font-medium">Ouvertures</th>
              <th className="px-4 py-3 font-medium">% lu (moy.)</th>
              <th className="px-4 py-3 font-medium">Taux de complétion</th>
              <th className="px-4 py-3 font-medium">Écoutes audio</th>
              <th className="px-4 py-3 font-medium">Favoris</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">Partages</th>
              <th className="px-4 py-3 font-medium">Signalements</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)]/60">
            {storyAnalytics.map((s) => (
              <tr key={s.slug} className="hover:bg-[var(--color-cream-100)]/60">
                <td className="px-4 py-3 max-w-56">
                  <span className="block truncate font-medium">{s.title}</span>
                </td>
                <td className="px-4 py-3">{n(s.opens)}</td>
                <td className="px-4 py-3">{s.readPct}%</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-16 rounded-full bg-[var(--color-cream-200)]">
                      <span
                        className="block h-1.5 rounded-full bg-[var(--color-mint-500)]"
                        style={{ width: `${s.completionRate}%` }}
                      />
                    </span>
                    {s.completionRate}%
                  </span>
                </td>
                <td className="px-4 py-3">{s.audioPlays ? n(s.audioPlays) : "·"}</td>
                <td className="px-4 py-3">{n(s.favorites)}</td>
                <td className="px-4 py-3">{s.avgRating.toFixed(1)}</td>
                <td className="px-4 py-3">{n(s.shares)}</td>
                <td className="px-4 py-3">
                  {s.reports > 0 ? (
                    <span className="text-red-600">{s.reports}</span>
                  ) : (
                    "·"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
