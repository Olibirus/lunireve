"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationBell } from "@/components/NotificationBell";
import { NavSearch } from "@/components/layout/NavSearch";
import { logout } from "@/app/actions/auth";
import { isLoggedIn } from "@/lib/clientAuth";
import { getActiveProfile } from "@/lib/profiles";
import { GENRES, AGE_RANGES, DURATION_BUCKETS, ageLabel } from "@/data/mock-stories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  BookOpen,
  ChevronDown,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User,
  Users,
  Wand2,
  X,
} from "lucide-react";

/**
 * Navbar V2 (feedback #13/#15/#17/#26), structure modeled on the
 * mes-histoires-du-soir pattern:
 *  Histoires (genres + tools) · Âges (1-2 → 11-12) · Durée · Créer
 *  Right side: search, theme, compact FR dropdown, single auth button
 *  (modal, 2 tabs) or profile menu when logged in. Burger menu on mobile.
 */

function NavDropdown({
  label,
  children,
  align = "left",
  href,
  contentClassName,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  /** When set, clicking the trigger navigates there; hover still opens the menu. */
  href?: string;
  /** Override the panel width/layout (e.g. compact age menu, #3). */
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const triggerClass = cn(
    "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors",
    open
      ? "text-[var(--color-ink-800)] bg-[var(--color-cream-200)]"
      : "text-[var(--color-ink-600)] hover:text-[var(--color-ink-800)] hover:bg-[var(--color-cream-100)]"
  );

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {href ? (
        <Link href={href as never} className={triggerClass} onClick={() => setOpen(false)}>
          {label}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </Link>
      ) : (
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={triggerClass}>
          {label}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      )}
      {open && (
        <div
          className={cn(
            "absolute top-full z-50 pt-2",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          <div
            className={cn(
              "min-w-56 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2 shadow-[var(--shadow-float)]",
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  icon: Icon,
}: {
  href: Parameters<typeof Link>[0]["href"];
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href as never}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-800)]"
    >
      {Icon && <Icon className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />}
      {children}
    </Link>
  );
}

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [logged, setLogged] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [streak, setStreak] = useState<number | null>(null);
  // Name shown under "account": the active child's name when reading as a
  // child, otherwise the parent's account name.
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
    setLogged(isLoggedIn());
    // Streak chip (#9): show the active child's reading streak to nudge
    // the daily habit. Hidden when no profile is active.
    try {
      const p = getActiveProfile();
      if (p) {
        setStreak(p.streak);
        setAccountName(p.name);
        return;
      }
    } catch {
      /* ignore */
    }
    // Parent session: pull the display name from the account info store.
    try {
      const info = JSON.parse(localStorage.getItem("lunireve:accountInfo") ?? "{}");
      if (info && typeof info.name === "string" && info.name.trim()) {
        setAccountName(info.name.trim());
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function onLogout() {
    await logout();
    setLogged(false);
    router.push("/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled || mobileOpen
          ? "bg-[var(--color-cream-50)]/90 backdrop-blur-md border-b border-[var(--color-ink-100)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 md:px-8">
        {/* Logo (#34 — larger) */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)]"
        >
          <Image
            src="/logo-s.png"
            alt="Lunireve"
            width={180}
            height={52}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav (#13/#26) */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-0.5">
          {/* Stories mega-menu: tools on the left, genres on the right,
              left-aligned like the Âge / Durée menus. */}
          <NavDropdown label={t("nav.stories")}>
            <div className="grid grid-cols-2 gap-x-2 min-w-[26rem] p-1">
              <div>
                <MenuLink href="/histoires" icon={BookOpen}>{t("nav.allStories")}</MenuLink>
                <MenuLink href={{ pathname: "/histoires", query: { interactive: "1" } }} icon={Sparkles}>
                  {t("nav.interactiveStories")}
                </MenuLink>
                <MenuLink href="/creer" icon={Wand2}>{t("nav.create")}</MenuLink>
              </div>
              <div className="border-l border-[var(--color-ink-100)] pl-2">
                {GENRES.map((g) => (
                  <MenuLink key={g} href={{ pathname: "/histoires/genre/[genre]", params: { genre: g } }}>
                    {t(`genres.${g}`)}
                  </MenuLink>
                ))}
              </div>
            </div>
          </NavDropdown>

          {/* Age labels are short, so the panel was far too wide (#3): two
              compact columns sized to content instead of one wide column. */}
          <NavDropdown label={t("nav.byAge")} contentClassName="min-w-0 w-max">
            <div className="grid grid-cols-2 gap-x-1">
              {AGE_RANGES.map((r) => (
                <MenuLink key={r} href={{ pathname: "/histoires/age/[range]", params: { range: r } }}>
                  {ageLabel(r)}
                </MenuLink>
              ))}
            </div>
          </NavDropdown>

          <NavDropdown label={t("nav.byDuration")}>
            {DURATION_BUCKETS.map((b) => (
              <MenuLink key={b} href={{ pathname: "/histoires/duree/[bucket]", params: { bucket: b } }}>
                {t(`durations.${b}`)}
              </MenuLink>
            ))}
          </NavDropdown>

          {/* Create — the product's USP, given a filled background (#4) */}
          <Link
            href="/creer"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink-800)] px-4 py-2 text-sm font-medium text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] transition-colors"
          >
            <Wand2 className="h-4 w-4 text-[var(--color-mint-400)]" />
            {t("nav.create")}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {logged && streak !== null && (
            <Link
              href="/enfant"
              title={t("nav.streakTitle")}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-fox-300)]/25 px-2.5 py-1.5 text-xs font-medium text-[var(--color-fox-700)] hover:bg-[var(--color-fox-300)]/40"
            >
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </Link>
          )}
          {logged && <NotificationBell />}
          <NavSearch />
          <ThemeToggle />
          <LanguageSwitcher />

          {logged ? (
            <NavDropdown
              label={
                accountName ? (
                  <span className="flex flex-col items-start leading-tight text-left">
                    <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      {t("nav.account")}
                    </span>
                    <span className="-mt-0.5 max-w-[8rem] truncate text-sm font-medium">
                      {accountName}
                    </span>
                  </span>
                ) : (
                  t("nav.account")
                )
              }
              align="right"
              href="/compte"
            >
              <MenuLink href="/compte" icon={LayoutDashboard}>{t("nav.menuDashboard")}</MenuLink>
              <MenuLink href="/profils" icon={Users}>{t("nav.menuProfiles")}</MenuLink>
              <MenuLink href="/compte/histoires" icon={BookOpen}>{t("account.menu.customStories")}</MenuLink>
              <MenuLink href="/compte/favoris" icon={Sparkles}>{t("account.menu.favorites")}</MenuLink>
              <MenuLink href="/creer" icon={Wand2}>{t("nav.create")}</MenuLink>
              {/* In-profile pricing, not the standalone public page. */}
              <MenuLink href="/compte/abonnement" icon={Sparkles}>{t("nav.pricing")}</MenuLink>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)] hover:text-[var(--color-ink-800)]"
              >
                <LogOut className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
                {t("nav.logout")}
              </button>
            </NavDropdown>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setAuthOpen(true)} className="hidden sm:inline-flex">
              <User className="h-4 w-4" />
              {t("nav.authButton")}
            </Button>
          )}

          {/* Burger (#15) */}
          <button
            type="button"
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink-100)] text-[var(--color-ink-600)] lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <nav
          aria-label="Navigation mobile"
          className="lg:hidden border-t border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 pb-6 pt-3 max-h-[75vh] overflow-y-auto"
        >
          <p className="px-1 text-xs uppercase tracking-widest text-[var(--color-ink-400)]">{t("nav.stories")}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <Link
                key={g}
                href={{ pathname: "/histoires/genre/[genre]", params: { genre: g } }}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-[var(--color-ink-100)] px-3 py-1.5 text-xs text-[var(--color-ink-600)]"
              >
                {t(`genres.${g}`)}
              </Link>
            ))}
          </div>

          <p className="mt-4 px-1 text-xs uppercase tracking-widest text-[var(--color-ink-400)]">{t("nav.byAge")}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {AGE_RANGES.map((r) => (
              <Link
                key={r}
                href={{ pathname: "/histoires/age/[range]", params: { range: r } }}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-[var(--color-ink-100)] px-3 py-1.5 text-xs text-[var(--color-ink-600)]"
              >
                {ageLabel(r)}
              </Link>
            ))}
          </div>

          <p className="mt-4 px-1 text-xs uppercase tracking-widest text-[var(--color-ink-400)]">{t("nav.byDuration")}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {DURATION_BUCKETS.map((b) => (
              <Link
                key={b}
                href={{ pathname: "/histoires/duree/[bucket]", params: { bucket: b } }}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-[var(--color-ink-100)] px-3 py-1.5 text-xs text-[var(--color-ink-600)]"
              >
                {t(`durations.${b}`)}
              </Link>
            ))}
          </div>

          <div className="mt-5 grid gap-2">
            <Link
              href={{ pathname: "/histoires", query: { interactive: "1" } }}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--color-ink-100)] px-4 py-2.5 text-sm"
            >
              <Sparkles className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
              {t("nav.interactiveStories")}
            </Link>
            <Link
              href="/creer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-xl bg-[var(--color-ink-800)] px-4 py-2.5 text-sm text-[var(--color-cream-50)]"
            >
              <Wand2 className="h-4 w-4 text-[var(--color-mint-400)]" />
              {t("nav.create")}
            </Link>
            {logged ? (
              <>
                <Link
                  href="/profils"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--color-ink-100)] px-4 py-2.5 text-sm"
                >
                  <Users className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
                  {t("nav.menuProfiles")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void onLogout();
                  }}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--color-ink-100)] px-4 py-2.5 text-sm text-left"
                >
                  <LogOut className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="justify-center"
              >
                <User className="h-4 w-4" />
                {t("nav.authButton")}
              </Button>
            )}
          </div>
        </nav>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onLoggedIn={() => setLogged(true)} />
    </header>
  );
}
