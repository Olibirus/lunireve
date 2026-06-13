"use client";

import { useState } from "react";
import { Kpi } from "@/components/admin/AdminShell";
import { AnalyticsTable } from "@/components/admin/AnalyticsTable";
import { DATE_RANGES, globalKpis, storyAnalytics } from "@/data/mock-admin";
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
  const exportTitle = `Analytics (${range === "all" ? "tout" : range + "j"})`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">
            Données de démonstration, branchement Umami + SQL au lot n8n.
          </p>
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

      {/* Per-story table — every column, sortable headers + Excel-style filters */}
      <div className="mt-10 flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-xl tracking-tight">Par histoire</h2>
        <p className="text-xs text-[var(--color-ink-400)]">
          Cliquez un en-tête pour trier, l&apos;entonnoir pour filtrer.
        </p>
      </div>
      <div className="mt-3">
        <AnalyticsTable
          rows={storyAnalytics}
          factor={factor}
          n={n}
          exportTitle={exportTitle}
        />
      </div>
    </>
  );
}
