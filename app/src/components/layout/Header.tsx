"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FoxMark } from "@/components/brand/FoxCloud";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";

/**
 * Top navigation. Sticky, with a subtle backdrop blur that appears only after
 * the user has scrolled — keeps the hero feeling boundless.
 *
 * Auth CTAs are rendered as placeholders (Phase 2 will wire them up).
 */
export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "/histoires" as const, label: t("nav.stories") },
    { href: "/creer" as const, label: t("nav.create") },
    { href: "/tarifs" as const, label: t("nav.pricing") },
    { href: "/a-propos" as const, label: t("nav.about") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "bg-[var(--color-cream-50)]/85 backdrop-blur-md border-b border-[var(--color-ink-100)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--color-ink-800)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] rounded-lg"
        >
          <FoxMark className="h-9 w-9" />
          <span className="font-serif text-xl tracking-tight">
            Lunireve
          </span>
        </Link>

        {/* Nav — desktop */}
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href as string);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-full transition-colors",
                      active
                        ? "text-[var(--color-ink-800)] bg-[var(--color-cream-200)]"
                        : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          <div className="hidden sm:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/connexion">{t("nav.login")}</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/inscription">{t("nav.signup")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
