"use client";

import { useMemo, useState } from "react";
import {
  mockUsers,
  globalKpis,
  formatEur,
  userTotalSpend,
  TIER_LABEL,
  type AdminUser,
  type Compensation,
} from "@/data/mock-admin";
import { Kpi, StatusPill } from "@/components/admin/AdminShell";
import { DemoBadge } from "@/components/admin/DemoBadge";
import { UsersTable } from "@/components/admin/UsersTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, Gift, RotateCcw } from "lucide-react";

const COMPENSATIONS = [
  "1 mois gratuit",
  "3 mois gratuits",
  "Remboursement du dernier paiement",
  "Impression offerte",
];

/**
 * Users — full per-account analytics with Excel-style filters, plus per-user
 * management: suspend / reactivate and goodwill compensation (free month,
 * refund, free print). State is local (demo); the actions mirror the future
 * API. Summary KPIs reflect the whole base; the table is a recent slice.
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [managing, setManaging] = useState<AdminUser | null>(null);

  const stats = useMemo(() => {
    const paying = users.filter((u) => u.tier !== "free").length;
    const totalSpend = users.reduce((s, u) => s + userTotalSpend(u), 0);
    const totalListen = users.reduce((s, u) => s + u.listenMinutes, 0);
    const avgRead = Math.round(
      users.reduce((s, u) => s + u.storiesRead, 0) / Math.max(1, users.length)
    );
    const payingUsers = users.filter((u) => u.tier !== "free");
    const monthly = payingUsers.reduce((s, u) => s + (u.tier === "max" ? 9.99 : 4.99), 0);
    const arpu = payingUsers.length ? monthly / payingUsers.length : 0;
    return { paying, totalSpend, totalListen, avgRead, arpu };
  }, [users]);

  function toggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "disabled" : "active" } : u
      )
    );
    setManaging((m) =>
      m && m.id === id ? { ...m, status: m.status === "active" ? "disabled" : "active" } : m
    );
  }

  function grantCompensation(id: string, label: string) {
    const comp: Compensation = { label, grantedAt: new Date().toISOString().slice(0, 10) };
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, compensations: [...(u.compensations ?? []), comp] } : u))
    );
    setManaging((m) =>
      m && m.id === id ? { ...m, compensations: [...(m.compensations ?? []), comp] } : m
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl tracking-tight">Utilisateurs</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
        {globalKpis.totalUsers.toLocaleString("fr-FR")} comptes au total, {globalKpis.paidUsers} payants.
        Tableau ci-dessous : échantillon récent, filtrable. Cliquez « Gérer » pour suspendre ou offrir un geste commercial.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Comptes (échantillon)" value={users.length} />
        <Kpi label="Payants (échantillon)" value={`${stats.paying} / ${users.length}`} />
        <Kpi label="Lecture moy. / compte" value={`${stats.avgRead} histoires`} />
        <Kpi label="Écoute cumulée" value={`${Math.round(stats.totalListen / 60)} h`} />
        <Kpi label="Revenu échantillon" value={formatEur(stats.totalSpend)} hint="abonnement + impression" />
        <Kpi label="ARPU (payant)" value={formatEur(stats.arpu, 2)} hint="revenu mensuel / payant" />
        <Kpi label="Profils enfants" value={globalKpis.childProfiles.toLocaleString("fr-FR")} />
        <Kpi label="Conversion compte" value={`${globalKpis.accountConversionPct}%`} hint="visiteurs → inscrits" />
      </div>

      <div className="mt-8">
        <UsersTable rows={users} onManage={setManaging} />
      </div>

      {managing && (
        <Dialog open onOpenChange={(o) => !o && setManaging(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{managing.name}</DialogTitle>
              <DialogDescription>
                {managing.email} · {managing.country} · {TIER_LABEL[managing.tier]}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-ink-500)]">Statut :</span>
                <StatusPill tone={managing.status === "active" ? "green" : "red"}>
                  {managing.status === "active" ? "Actif" : "Suspendu"}
                </StatusPill>
                <span className="ml-auto text-sm text-[var(--color-ink-500)]">
                  Total dépensé : <span className="font-medium text-[var(--color-ink-800)]">{formatEur(userTotalSpend(managing), 2)}</span>
                </span>
              </div>

              {/* Suspend / reactivate */}
              <div>
                {managing.status === "active" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleStatus(managing.id)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Ban className="h-4 w-4" />
                    Suspendre le compte
                  </Button>
                ) : (
                  <Button variant="mint" size="sm" onClick={() => toggleStatus(managing.id)}>
                    <RotateCcw className="h-4 w-4" />
                    Réactiver le compte
                  </Button>
                )}
              </div>

              {/* Compensation */}
              <div className="rounded-2xl border border-[var(--color-ink-100)] p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Gift className="h-4 w-4 text-[var(--color-fox-600)]" />
                  Offrir un geste commercial
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {COMPENSATIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => grantCompensation(managing.id, c)}
                      className="rounded-full border border-[var(--color-ink-100)] px-3 py-1.5 text-xs text-[var(--color-ink-700)] hover:bg-[var(--color-cream-100)]"
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {managing.compensations && managing.compensations.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-[var(--color-ink-100)] pt-3 text-xs text-[var(--color-ink-600)]">
                    {managing.compensations.map((comp, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>✓ {comp.label}</span>
                        <span className="text-[var(--color-ink-400)]">{comp.grantedAt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-[var(--color-ink-100)] pt-4">
              <Button variant="ghost" size="sm" onClick={() => setManaging(null)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
