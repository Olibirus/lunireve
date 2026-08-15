"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Menu, X } from "lucide-react";

/**
 * Mobile access to the account menu (the left rail on desktop).
 *
 * A slide-over drawer rather than an accordion pushed above the content: the
 * menu has three groups plus one row per child, so inlining it meant scrolling
 * past the whole navigation to reach the page every single time. The drawer
 * keeps the page as the first thing you see, and the trigger names the section
 * you are currently in so the bar doubles as a "you are here" marker.
 */
export function AccountNavDrawer() {
  const t = useTranslations("account");
  const tMenu = useTranslations("account.menu");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // document.body only exists client-side; portal after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Route change closes it (the drawer is outside the navigated subtree).
  useEffect(() => setOpen(false), [pathname]);

  // Same body lock as the burger: fixed rather than overflow:hidden for iOS.
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const { body } = document;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    return () => {
      Object.assign(body.style, previous);
      window.scrollTo(0, y);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const CURRENT: Record<string, string> = {
    "/compte": tMenu("dashboard"),
    "/compte/favoris": tMenu("favorites"),
    "/compte/abonnement": tMenu("plan"),
    "/compte/parametres": tMenu("settings"),
    "/compte/histoires": tMenu("customStories"),
    "/compte/personnages": tMenu("characters"),
    "/creer": tMenu("create"),
    "/profils": tMenu("profiles"),
  };
  const current = CURRENT[pathname] ?? t("title");

  /**
   * The overlay is portalled to <body>.
   *
   * The trigger sits in a sticky, backdrop-blurred strip, and a
   * `backdrop-filter` ancestor becomes the containing block for
   * `position: fixed` children: rendered in place, the drawer was clipped to
   * that thin bar instead of covering the screen.
   */
  const overlay = open ? (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" id="account-nav-drawer">
      <button
        type="button"
        aria-label={t("closeNav")}
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
      />
      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto overscroll-contain border-r border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5 shadow-[var(--shadow-float)]">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-[var(--color-ink-500)]">
            {t("navLabel")}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeNav")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink-100)] text-[var(--color-ink-600)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <AccountSidebar />
      </div>
    </div>
  ) : null;

  return (
    // Sticks under the account top bar (h-16) so "where am I / the menu" stays
    // reachable on a phone without scrolling back up. The negative margins let
    // the sticky strip span the full width while the page keeps its padding.
    <div className="lg:hidden sticky top-16 z-30 -mx-5 md:-mx-8 border-b border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/90 px-5 py-2.5 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="account-nav-drawer"
        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] px-4 py-3 text-left"
      >
        <Menu className="h-4 w-4 shrink-0 text-[var(--color-indigo-soft-500)]" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-ink-400)]">
            {t("navLabel")}
          </span>
          <span className="truncate text-sm font-medium text-[var(--color-ink-800)]">{current}</span>
        </span>
      </button>

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </div>
  );
}
