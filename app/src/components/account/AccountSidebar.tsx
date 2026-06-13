"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Heart,
  LayoutDashboard,
  Mail,
  PenLine,
  Rocket,
  Settings,
  Users,
  UserSquare,
  Wand2,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Parent-area sidebar (#11) — mes-histoires-du-soir layout: grouped menu
 * on the left, content on the right. Every V1 surface is reachable here;
 * rallyes (V3) intentionally absent.
 */
export function AccountSidebar() {
  const t = useTranslations("account.menu");
  const pathname = usePathname();

  const groups: {
    label: string;
    items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  }[] = [
    {
      label: t("groupAccount"),
      items: [
        { href: "/compte", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/compte/favoris", label: t("favorites"), icon: Heart },
        { href: "/compte/proposer", label: t("submit"), icon: PenLine },
        { href: "/compte/newsletter", label: t("newsletter"), icon: Mail },
        { href: "/compte/abonnement", label: t("plan"), icon: Rocket },
        { href: "/compte/parametres", label: t("settings"), icon: Settings },
      ],
    },
    {
      label: t("groupCustom"),
      items: [
        { href: "/compte/histoires", label: t("customStories"), icon: BookMarked },
        { href: "/compte/personnages", label: t("characters"), icon: UserSquare },
        { href: "/creer", label: t("create"), icon: Wand2 },
      ],
    },
    {
      label: t("groupChildren"),
      items: [{ href: "/profils", label: t("profiles"), icon: Users }],
    },
  ];

  return (
    <nav aria-label="Menu du compte" className="space-y-7">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] uppercase tracking-widest text-[var(--color-ink-400)]">
            {group.label}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href as never}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-[var(--color-mint-100)] text-[var(--color-ink-800)] font-medium"
                        : "text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-800)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-[var(--color-mint-700)]" : "text-[var(--color-indigo-soft-500)]"
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
