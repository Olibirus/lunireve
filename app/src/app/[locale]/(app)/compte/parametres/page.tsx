"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Account settings — trimmed (language now lives in the navbar, #5). */
export default function SettingsPage() {
  const t = useTranslations("account");

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{t("settings")}</h1>
      <div className="mt-6 max-w-xl divide-y divide-[var(--color-ink-100)] rounded-3xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm">{t("darkMode")}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm">{t("newsletter")}</span>
          <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-xs text-[var(--color-ink-500)]">
            {t("soon")}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-[var(--color-fox-700)]">{t("deleteAccount")}</span>
          <span className="rounded-full bg-[var(--color-cream-200)] px-2.5 py-0.5 text-xs text-[var(--color-ink-500)]">
            {t("soon")}
          </span>
        </div>
      </div>
      <p className="mt-3 max-w-xl text-xs text-[var(--color-ink-400)]">{t("gdprNote")}</p>
    </div>
  );
}
