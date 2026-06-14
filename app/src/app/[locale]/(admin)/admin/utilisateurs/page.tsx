import {
  mockUsers,
  globalKpis,
  formatEur,
  userTotalSpend,
} from "@/data/mock-admin";
import { Kpi } from "@/components/admin/AdminShell";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { UsersTable } from "@/components/admin/UsersTable";

/**
 * Users — full per-account analytics with Excel-style filters (UsersTable).
 * Summary KPIs reflect the whole base; the table shows a recent demo slice.
 * Real signups + Stripe spend replace this at the Supabase swap.
 */
export default function AdminUsersPage() {
  const paying = mockUsers.filter((u) => u.tier !== "free").length;
  const totalSpend = mockUsers.reduce((s, u) => s + userTotalSpend(u), 0);
  const totalListen = mockUsers.reduce((s, u) => s + u.listenMinutes, 0);
  const avgRead = Math.round(
    mockUsers.reduce((s, u) => s + u.storiesRead, 0) / Math.max(1, mockUsers.length)
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl tracking-tight">Utilisateurs</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        {globalKpis.totalUsers.toLocaleString("fr-FR")} comptes au total, {globalKpis.paidUsers} payants.
        Tableau ci-dessous : échantillon récent, filtrable.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Comptes (échantillon)" value={mockUsers.length} />
        <Kpi label="Payants (échantillon)" value={`${paying} / ${mockUsers.length}`} />
        <Kpi label="Lecture moy. / compte" value={`${avgRead} histoires`} />
        <Kpi label="Écoute cumulée" value={`${Math.round(totalListen / 60)} h`} />
        <Kpi label="Revenu échantillon" value={formatEur(totalSpend)} hint="abonnement + impression" />
        <Kpi label="ARPU (payant)" value={formatEur(revenueArpu(), 2)} hint="revenu mensuel / payant" />
        <Kpi label="Profils enfants" value={globalKpis.childProfiles.toLocaleString("fr-FR")} />
        <Kpi label="Conversion compte" value={`${globalKpis.accountConversionPct}%`} hint="visiteurs → inscrits" />
      </div>

      <div className="mt-8">
        <UsersTable rows={mockUsers} />
      </div>
    </>
  );
}

function revenueArpu(): number {
  // Local helper kept page-side to avoid an extra import cycle.
  const paying = mockUsers.filter((u) => u.tier !== "free");
  if (!paying.length) return 0;
  // Monthly equivalent: Plus 4.99, Max 9.99.
  const monthly = paying.reduce((s, u) => s + (u.tier === "max" ? 9.99 : 4.99), 0);
  return monthly / paying.length;
}
