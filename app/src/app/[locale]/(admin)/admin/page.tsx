import { Link } from "@/i18n/navigation";
import { Kpi, StatusPill } from "@/components/admin/AdminShell";
import {
  globalKpis,
  mockReports,
  mockSubmissions,
  storyAnalytics,
} from "@/data/mock-admin";

/** Admin dashboard — the morning coffee view. */
export default function AdminDashboard() {
  const topStories = [...storyAnalytics].sort((a, b) => b.opens - a.opens).slice(0, 5);

  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Tableau de bord</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        Vue d'ensemble — données de démonstration jusqu'au branchement Supabase.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Utilisateurs" value={globalKpis.totalUsers} hint={`+${globalKpis.newUsers7d} sur 7 jours`} />
        <Kpi label="Actifs (30 j)" value={globalKpis.activeUsers30d} />
        <Kpi label="Histoires publiées" value={globalKpis.storiesPublished} />
        <Kpi label="Histoires personnalisées" value={globalKpis.customStoriesCreated} />
        <Kpi label="Profils enfants" value={globalKpis.childProfiles} />
        <Kpi label="Newsletter" value={globalKpis.newsletterSignups} />
        <Kpi label="Soumissions en attente" value={globalKpis.pendingSubmissions} />
        <Kpi label="Signalements ouverts" value={globalKpis.openReports} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
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
