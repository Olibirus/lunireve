"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/app/actions/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { BookOpen, LogOut } from "lucide-react";

/**
 * Parent-area shell (#11): top bar + persistent left sidebar. Full-viewport
 * width with normal margins (the sidebar hugs the left edge instead of
 * floating inside a centered grid). Shared by every /compte page AND the
 * story-creation flow, so families never leave the portal chrome.
 */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account");
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/90 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-s.webp" alt="Lunireve" width={170} height={49} className="h-11 w-auto" priority />
          </Link>
          <div className="flex items-center gap-2">
            {/* Straight back to reading (#feedback): land on the full library */}
            <Link
              href="/histoires"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink-800)] px-3.5 py-1.5 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t("backToStories")}
            </Link>
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

      <div className="grid w-full gap-8 px-5 md:px-8 py-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-24 h-fit">
          {/* Mobile: quick library link (header one is sm+) */}
          <Link
            href="/histoires"
            className="mb-5 flex sm:hidden items-center gap-2.5 rounded-xl bg-[var(--color-ink-800)] px-3 py-2 text-sm text-[var(--color-cream-50)]"
          >
            <BookOpen className="h-4 w-4" />
            {t("backToStories")}
          </Link>
          <AccountSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
