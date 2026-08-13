"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/app/actions/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountNavDrawer } from "@/components/account/AccountNavDrawer";
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
          {/* On phones the labels collapse to icons: the five full-width
              controls did not fit a 375px bar and forced the page to scroll
              sideways. */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Straight back to reading (#feedback): land on the full library */}
            <Link
              href="/histoires"
              aria-label={t("backToStories")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink-800)] p-2 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] sm:px-3.5 sm:py-1.5"
            >
              <BookOpen className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{t("backToStories")}</span>
            </Link>
            <NotificationBell />
            <ThemeToggle />
            <span className="hidden sm:inline-flex">
              <LanguageSwitcher />
            </span>
            <button
              type="button"
              onClick={onLogout}
              aria-label={t("logout")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-100)] p-2 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] sm:px-3.5 sm:py-1.5"
            >
              <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid w-full gap-5 px-5 md:px-8 py-6 lg:gap-8 lg:py-8 lg:grid-cols-[230px_1fr]">
        {/* Below lg the rail becomes a drawer, so the page content is what you
            land on instead of a screenful of navigation. */}
        <AccountNavDrawer />
        <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
          <AccountSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
