import { Link } from "@/i18n/navigation";
import { Kpi, StatusPill } from "@/components/admin/AdminShell";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { RevenueChart } from "@/components/admin/RevenueChart";
import {
  globalKpis,
  mockReports,
  mockSubmissions,
  storyAnalytics,
  revenueKpis,
  revenueByTier,
  revenueByCountry,
  revenueSeries,
  revenueForecast,
  formatEur,
} from "@/data/mock-admin";

/** Admin dashboard, the morning coffee view. */
export default function AdminDashboard() {
  const topStories = [...storyAnalytics].sort((a, b) => b.opens - a.opens).slice(0, 5);
  const maxTierMrr = Math.max(...revenueByTier.map((t) => t.mrr), 1);
  const maxCountryRev = Math.max(...revenueByCountry.map((c) => c.revenue), 1);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl tracking-tight">Tableau de bord</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        Vue d&apos;ensemble. Données de démonstration jusqu&apos;au branchement Supabase + Stripe.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Utilisateurs" value={globalKpis.totalUsers.toLocaleString("fr-FR")} hint={`+${globalKpis.newUsers7d} sur 7 jours`} />
        <Kpi label="Actifs (30 j)" value={globalKpis.activeUsers30d.toLocaleString("fr-FR")} />
        <Kpi label="Histoires publiées" value={globalKpis.storiesPublished} />
        <Kpi label="Histoires personnalisées" value={globalKpis.customStoriesCreated.toLocaleString("fr-FR")} />
        <Kpi label="Profils enfants" value={globalKpis.childProfiles.toLocaleString("fr-FR")} />
        <Kpi label="Newsletter" value={globalKpis.newsletterSignups.toLocaleString("fr-FR")} />
        <Kpi label="Soumissions en attente" value={globalKpis.pendingSubmissions} />
        <Kpi label="Signalements ouverts" value={globalKpis.openReports} />
      </div>

      {/* Revenue */}
      <div className="mt-12 flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl tracking-tight">Revenu</h2>
        <DemoBadge />
        <span className="text-xs text-[var(--color-ink-400)]">Paiements en V2 (Stripe)</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="MRR (présent)" value={formatEur(revenueKpis.mrr)} hint={`${revenueKpis.activeSubscribers} abonnés payants`} />
        <Kpi label="Projection 30 j (futur)" value={formatEur(revenueKpis.projectedNext30)} hint="+12% est." />
        <Kpi label="Revenu total à ce jour (passé)" value={formatEur(revenueKpis.totalToDate)} hint="récurrent + impression" />
        <Kpi label="ARR (annualisé)" value={formatEur(revenueKpis.arr)} />
        <Kpi label="Récurrent cumulé" value={formatEur(revenueKpis.recurringToDate)} hint={`${revenueKpis.recurringSharePct}% du total`} />
        <Kpi label="Impression cumulée" value={formatEur(revenueKpis.oneOffToDate)} hint="livres imprimés" />
        <Kpi label="ARPU" value={formatEur(revenueKpis.arpu, 2)} hint="par abonné payant / mois" />
        <Kpi label="Abonnés payants" value={revenueKpis.activeSubscribers} />
      </div>

      {/* Revenue graph */}
      <section className="mt-6 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg tracking-tight">Revenu mensuel</h3>
          <span className="text-xs text-[var(--color-ink-400)]">12 derniers mois + prévision</span>
        </div>
        <div className="mt-4">
          <RevenueChart history={revenueSeries} forecast={revenueForecast} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Per tier */}
        <section className="rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5">
          <h3 className="font-serif text-lg tracking-tight">Par palier</h3>
          <div className="mt-4 space-y-3">
            {revenueByTier.map((t) => (
              <div key={t.tier} className="text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{t.label}</span>
                  <span className="text-[var(--color-ink-500)]">
                    {t.subscribers.toLocaleString("fr-FR")} ab.
                    {t.price > 0 && ` · ${formatEur(t.price, 2)}/mois`}
                  </span>
                  <span className="ml-auto font-medium">{formatEur(t.mrr)}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[var(--color-cream-200)]">
                  <span
                    className="block h-1.5 rounded-full bg-[var(--color-indigo-soft-400)]"
                    style={{ width: `${(t.mrr / maxTierMrr) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Per country */}
        <section className="rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5">
          <h3 className="font-serif text-lg tracking-tight">Par pays</h3>
          <div className="mt-4 space-y-3">
            {revenueByCountry.map((c) => (
              <div key={c.code} className="text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">
                    <span className="text-[var(--color-ink-400)]">{c.code}</span> {c.country}
                  </span>
                  <span className="text-[var(--color-ink-500)]">{c.users.toLocaleString("fr-FR")} comptes</span>
                  <span className="ml-auto font-medium">{formatEur(c.revenue)}/mois</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[var(--color-cream-200)]">
                  <span
                    className="block h-1.5 rounded-full bg-[var(--color-mint-500)]"
                    style={{ width: `${(c.revenue / maxCountryRev) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Top stories */}
        <section>
          <h2 className="font-serif text-xl tracking-tight">Top histoires (ouvertures)</h2>
          <ul className="mt-4 divide-y divide-[var(--color-ink-100)] rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
            {topStories.map((s, i) => (
              <li key={s.slug} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-5 font-serif text-[var(--color-indigo-soft-500)]">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{s.title}</span>
                <span className="text-[var(--color-ink-500)]">{s.opens.toLocaleString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Needs attention */}
        <section>
          <h2 className="font-serif text-xl tracking-tight">À traiter</h2>
          <ul className="mt-4 space-y-3">
            {mockSubmissions
              .filter((s) => s.status === "pending")
              .map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-sm"
                >
                  <StatusPill tone="amber">Soumission</StatusPill>
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <Link href={"/admin/moderation" as never} className="text-[var(--color-indigo-soft-600)] hover:underline">
                    Examiner
                  </Link>
                </li>
              ))}
            {mockReports
              .filter((r) => r.status !== "resolved")
              .map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-3 text-sm"
                >
                  <StatusPill tone={r.status === "open" ? "red" : "amber"}>
                    Signalement
                  </StatusPill>
                  <span className="min-w-0 flex-1 truncate">{r.storyTitle}</span>
                  <Link href={"/admin/moderation" as never} className="text-[var(--color-indigo-soft-600)] hover:underline">
                    Examiner
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </>
  );
}
