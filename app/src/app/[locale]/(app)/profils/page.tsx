"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  readProfiles,
  setActiveProfile,
  clearActiveProfile,
  profileLimit,
  type ChildProfile,
} from "@/lib/profiles";
import { FoxMark } from "@/components/brand/FoxCloud";
import { ChildAvatar } from "@/components/brand/ChildAvatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Flame, Lock, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Netflix-style profile selector — "Qui lit ce soir ?".
 * Tap a child card → child bubble. "C'est moi" → parent dashboard.
 * Add-a-child locks (soft upgrade badge) once the free limit is reached.
 */
export default function ProfileSelectorPage() {
  const t = useTranslations("profiles");
  const router = useRouter();
  const [profiles, setProfiles] = useState<ChildProfile[] | null>(null);

  useEffect(() => {
    setProfiles(readProfiles());
  }, []);

  function enter(profile: ChildProfile) {
    setActiveProfile(profile.id);
    router.push("/enfant");
  }

  const limitReached = (profiles?.length ?? 0) >= profileLimit();

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-5 py-16">
      {/* Language toggle: this screen has no navbar of its own */}
      <div className="absolute right-5 top-5 md:right-8 md:top-8">
        <LanguageSwitcher />
      </div>
      <FoxMark className="h-12 w-12" />
      <h1
        className="mt-6 text-center font-serif text-3xl md:text-5xl tracking-tight"
        style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 70, 'wght' 500" }}
      >
        {t("whoTonight")}
      </h1>

      <div className="mt-12 flex flex-wrap items-stretch justify-center gap-5 md:gap-7">
        {profiles?.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => enter(p)}
            className={cn(
              "group flex w-36 md:w-44 flex-col items-center gap-3 rounded-3xl border border-[var(--color-ink-100)]",
              "bg-[var(--color-cream-50)] p-6 shadow-[var(--shadow-soft)] transition-colors",
              "hover:border-[var(--color-mint-500)] hover:shadow-[var(--shadow-card)]"
            )}
          >
            <ChildAvatar color={p.avatar} className="h-24 w-24 md:h-28 md:w-28" />
            <span className="font-serif text-xl tracking-tight">{p.name}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs",
                p.streak > 0
                  ? "bg-[var(--color-fox-300)]/25 text-[var(--color-fox-700)]"
                  : "bg-[var(--color-cream-200)] text-[var(--color-ink-400)]"
              )}
            >
              <Flame className="h-3 w-3" />
              {t("streakDays", { count: p.streak })}
            </span>
          </button>
        ))}

        {/* Add a child — locked when free limit reached */}
        {limitReached ? (
          <Link
            href="/compte/abonnement"
            className="flex w-36 md:w-44 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--color-indigo-soft-300)] bg-[var(--color-cream-100)] p-6 text-center transition-colors hover:border-[var(--color-indigo-soft-500)]"
          >
            <span className="rounded-full bg-[var(--color-indigo-soft-100)] p-4">
              <Lock className="h-6 w-6 text-[var(--color-indigo-soft-500)]" />
            </span>
            <span className="text-sm font-semibold text-[var(--color-ink-800)]">{t("addChildLocked")}</span>
            <span className="rounded-full bg-[var(--color-indigo-soft-600)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
              {t("upgradeBadge")}
            </span>
          </Link>
        ) : (
          <Link
            href="/profils/nouveau"
            className={cn(
              "flex w-36 md:w-44 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed",
              "border-[var(--color-ink-200)] p-6 text-center text-[var(--color-ink-500)] transition-colors",
              "hover:border-[var(--color-mint-500)] hover:text-[var(--color-ink-800)]"
            )}
          >
            <span className="rounded-full bg-[var(--color-mint-100)] p-4">
              <Plus className="h-6 w-6" />
            </span>
            <span className="text-sm">{t("addChild")}</span>
          </Link>
        )}
      </div>

      <Link
        href="/compte"
        onClick={() => clearActiveProfile()}
        className="mt-12 inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-5 py-2.5 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
      >
        <User className="h-4 w-4" />
        {t("me")}
      </Link>
    </section>
  );
}
