"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { logout } from "@/app/actions/auth";
import { moderationPendingCount } from "@/data/mock-admin";
import { FoxMark } from "@/components/brand/FoxCloud";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ShieldAlert,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Admin chrome — ink sidebar, dense layout, "ADMIN" badge so the back-office
 * is never confused with the user UI. Internal tool: French only.
 */

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/histoires", label: "Histoires", icon: BookOpen },
  { href: "/admin/moderation", label: "Modération", icon: ShieldAlert, badge: moderationPendingCount },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="band-ink sticky top-0 flex h-screen w-60 shrink-0 flex-col p-4 text-[var(--color-cream-50)]">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <FoxMark className="h-9 w-9" />
          <span className="font-serif text-lg tracking-tight">Lunireve</span>
          <span className="ml-auto rounded bg-[var(--color-fox-500)] px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-white">
            ADMIN
          </span>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon, ...rest }) => {
            const active =
              "exact" in rest && rest.exact
                ? pathname === href
                : pathname.startsWith(href);
            const badge = "badge" in rest ? rest.badge : 0;
            return (
              <Link
                key={href}
                href={href as never}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--color-ink-700)] text-[var(--color-cream-50)]"
                    : "text-[var(--color-indigo-soft-300)] hover:bg-[var(--color-ink-700)]/60 hover:text-[var(--color-cream-50)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {!!badge && (
                  <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-[var(--color-ink-700)] pt-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-indigo-soft-300)] hover:text-[var(--color-cream-50)]"
          >
            <ExternalLink className="h-4 w-4" />
            Voir le site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-indigo-soft-300)] hover:text-[var(--color-cream-50)]"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}

/** Small KPI tile used across admin pages. */
export function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--color-ink-400)]">{label}</p>
      <p className="mt-1.5 font-serif text-3xl tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-ink-500)]">{hint}</p>}
    </div>
  );
}

/** Status pill for tables. */
export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red" | "gray";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-[var(--color-mint-100)] text-[var(--color-mint-800)] border-[var(--color-mint-300)]",
    amber: "bg-[var(--color-fox-300)]/20 text-[var(--color-fox-700)] border-[var(--color-fox-300)]",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-[var(--color-cream-200)] text-[var(--color-ink-500)] border-[var(--color-ink-100)]",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs", tones[tone])}>
      {children}
    </span>
  );
}
