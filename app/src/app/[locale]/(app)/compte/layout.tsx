"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/app/actions/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { LogOut } from "lucide-react";

/**
 * Parent area shell (#11): top bar + persistent left sidebar, content on
 * the right — the mes-histoires-du-soir dashboard pattern.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account");
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-s.png" alt="Lunireve" width={170} height={49} className="h-11 w-auto" priority />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-100)] px-3.5 py-1.5 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 h-fit">
          <AccountSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
