"use client";

import { useTranslations } from "next-intl";
import { AuthPanel } from "@/components/auth/AuthPanel";

/**
 * Standalone auth page (/connexion, /en/login) — the exact same two-tab
 * panel as the header modal (login + signup), for links that navigate here
 * directly. Defaults to the SIGNUP tab: most arrivals from marketing links
 * don't have an account yet.
 */
export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <section className="mx-auto max-w-md px-5 py-16 md:py-24">
      <div className="text-center">
        {/* Real brand logo (not the fox mark) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-s.png" alt="Lunireve" className="mx-auto h-20 w-auto" />
        <h1
          className="mt-6 font-serif text-3xl md:text-4xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("title")}
        </h1>
        <p className="mt-3 text-[var(--color-ink-500)]">{t("subtitle")}</p>
      </div>

      <div className="mt-10">
        <AuthPanel defaultTab="signup" />
      </div>

      <p className="mt-6 text-center text-xs text-[var(--color-ink-400)]">{t("hint")}</p>
    </section>
  );
}
