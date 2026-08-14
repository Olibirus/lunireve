"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { clearActiveProfile, type ChildProfile } from "@/lib/profiles";
import { ChildAvatar } from "@/components/brand/ChildAvatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flame, LogOut } from "lucide-react";

/**
 * The child bubble's top bar — deliberately tiny: who is reading, and the way
 * out. No genres, no search, no account menu.
 *
 * It is rendered by the site Header too (see Header.tsx), so a child who opens
 * a story keeps this bar instead of being handed the full parent navigation.
 * The avatar doubles as the way back to the bubble.
 */
export function ChildTopBar({ profile }: { profile: ChildProfile }) {
  const t = useTranslations("child");
  const router = useRouter();

  function exit() {
    clearActiveProfile();
    router.push("/profils");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-8">
        {/* Who is reading — also the way home from a story page */}
        <Link
          href="/enfant"
          className="flex min-w-0 items-center gap-3 rounded-full transition-opacity hover:opacity-80"
        >
          <ChildAvatar color={profile.avatar} className="h-10 w-10" />
          <span className="truncate font-serif text-lg tracking-tight">{profile.name}</span>
        </Link>

        {/* Everything else lives on the right, grouped together */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            title={t("streakTitle")}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-fox-300)]/25 px-2.5 py-1 text-xs text-[var(--color-fox-700)]"
          >
            <Flame className="h-3.5 w-3.5" />
            {profile.streak}
          </span>
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            type="button"
            onClick={exit}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-100)] px-3.5 py-1.5 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("exit")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
