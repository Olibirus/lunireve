"use client";

import { useMemo } from "react";
import {
  formatEur,
  TIER_LABEL,
  userTotalSpend,
  type AdminUser,
} from "@/data/mock-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusPill } from "@/components/admin/AdminShell";
import { SlidersHorizontal } from "lucide-react";

/** Minutes → "3 h 20" / "45 min". */
function formatMinutes(min: number): string {
  if (min <= 0) return "·";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

const TIER_TONE = { free: "gray", plus: "green", max: "amber" } as const;

/**
 * Users table — full per-user analytics (country, listen time, stories read,
 * lifetime spend = subscription + print) with sortable headers and Excel-style
 * filters (DataTable). Demo rows until Supabase Auth + Stripe land.
 */
export function UsersTable({
  rows,
  onManage,
}: {
  rows: AdminUser[];
  onManage?: (u: AdminUser) => void;
}) {
  const columns = useMemo<Column<AdminUser>[]>(
    () => [
      {
        key: "name",
        label: "Nom",
        type: "text",
        sortVal: (u) => u.name.toLowerCase(),
        filterVal: (u) => u.name,
        cell: (u) => (
          <span className="block">
            <span className="block font-medium">{u.name}</span>
            <span className="block text-xs text-[var(--color-ink-400)]">{u.email}</span>
          </span>
        ),
        exp: (u) => u.name,
      },
      {
        key: "country",
        label: "Pays",
        type: "cat",
        sortVal: (u) => u.country,
        filterVal: (u) => u.country,
        cell: (u) => (
          <span>
            <span className="text-[var(--color-ink-400)]">{u.countryCode}</span> {u.country}
          </span>
        ),
        exp: (u) => u.country,
      },
      {
        key: "tier",
        label: "Formule",
        type: "cat",
        sortVal: (u) => ({ free: 0, plus: 1, max: 2 })[u.tier],
        filterVal: (u) => TIER_LABEL[u.tier],
        cell: (u) => <StatusPill tone={TIER_TONE[u.tier]}>{TIER_LABEL[u.tier]}</StatusPill>,
        exp: (u) => TIER_LABEL[u.tier],
      },
      {
        key: "children",
        label: "Enfants",
        type: "num",
        align: "right",
        sortVal: (u) => u.children,
        cell: (u) => u.children,
      },
      {
        key: "storiesRead",
        label: "Histoires lues",
        type: "num",
        align: "right",
        sortVal: (u) => u.storiesRead,
        cell: (u) => u.storiesRead.toLocaleString("fr-FR"),
      },
      {
        key: "customStories",
        label: "Créées",
        type: "num",
        align: "right",
        sortVal: (u) => u.customStories,
        cell: (u) => u.customStories,
      },
      {
        key: "listen",
        label: "Écoute",
        type: "num",
        align: "right",
        sortVal: (u) => u.listenMinutes,
        cell: (u) => formatMinutes(u.listenMinutes),
        exp: (u) => formatMinutes(u.listenMinutes),
      },
      {
        key: "subSpend",
        label: "Abonnement",
        type: "num",
        align: "right",
        sortVal: (u) => u.subscriptionSpend,
        cell: (u) => (u.subscriptionSpend ? formatEur(u.subscriptionSpend, 2) : "·"),
        exp: (u) => u.subscriptionSpend,
      },
      {
        key: "printSpend",
        label: "Impression",
        type: "num",
        align: "right",
        sortVal: (u) => u.printSpend,
        cell: (u) => (u.printSpend ? formatEur(u.printSpend, 2) : "·"),
        exp: (u) => u.printSpend,
      },
      {
        key: "total",
        label: "Total dépensé",
        type: "num",
        align: "right",
        sortVal: (u) => userTotalSpend(u),
        cell: (u) => (
          <span className="font-medium">{userTotalSpend(u) ? formatEur(userTotalSpend(u), 2) : "·"}</span>
        ),
        exp: (u) => userTotalSpend(u),
      },
      {
        key: "signedUp",
        label: "Inscription",
        type: "num",
        sortVal: (u) => u.signedUpAt,
        cell: (u) => (
          <span className="text-[var(--color-ink-500)]">
            {new Date(u.signedUpAt).toLocaleDateString("fr-FR")}
          </span>
        ),
        exp: (u) => u.signedUpAt,
      },
      {
        key: "lastActive",
        label: "Dernière activité",
        type: "num",
        sortVal: (u) => u.lastActiveAt,
        cell: (u) => (
          <span className="text-[var(--color-ink-500)]">
            {new Date(u.lastActiveAt).toLocaleDateString("fr-FR")}
          </span>
        ),
        exp: (u) => u.lastActiveAt,
      },
      {
        key: "status",
        label: "Statut",
        type: "cat",
        sortVal: (u) => u.status,
        filterVal: (u) => (u.status === "active" ? "Actif" : "Désactivé"),
        cell: (u) => (
          <StatusPill tone={u.status === "active" ? "green" : "red"}>
            {u.status === "active" ? "Actif" : "Désactivé"}
          </StatusPill>
        ),
        exp: (u) => (u.status === "active" ? "Actif" : "Désactivé"),
      },
      ...(onManage
        ? [
            {
              key: "actions",
              label: "Gérer",
              type: "num" as const,
              align: "right" as const,
              sortVal: () => "",
              cell: (u: AdminUser) => (
                <button
                  type="button"
                  onClick={() => onManage(u)}
                  aria-label={`Gérer ${u.name}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-100)] px-2.5 py-1.5 text-xs text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Gérer
                </button>
              ),
              exp: () => "",
            },
          ]
        : []),
    ],
    [onManage]
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(u) => u.id}
      initialSortKey="total"
      initialSortDir="desc"
      exportTitle="Utilisateurs"
      emptyText="Aucun compte pour l'instant. Les inscriptions apparaîtront ici."
      unit="comptes"
    />
  );
}
