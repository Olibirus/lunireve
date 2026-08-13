"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationBell } from "@/components/NotificationBell";
import { NavSearch } from "@/components/layout/NavSearch";
import { logout } from "@/app/actions/auth";
import { isLoggedIn, getRole, getUsername, broadcastLogout, onLogoutBroadcast } from "@/lib/clientAuth";
import { getActiveProfile } from "@/lib/profiles";
import { scopedKey } from "@/lib/userScope";
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
  Rocket,
  ShieldCheck,
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
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  /** When set, clicking the trigger navigates there; hover still opens the menu. */
  href?: string;
  /** Override the panel width/layout (e.g. compact age menu, #3). */
  contentClassName?: string;
  /** Wrapper classes, e.g. hiding the whole dropdown below a breakpoint. */
  className?: string;
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
      className={cn("relative", className)}
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

/** Collapsible section for the mobile menu: tap the heading to reveal options. */
function MobileSection({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: (id: string | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--color-ink-100)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(open ? null : id)}
        className="flex w-full items-center justify-between px-1 py-3 text-xs uppercase tracking-widest text-[var(--color-ink-500)]"
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="flex flex-wrap gap-1.5 pb-3">{children}</div>}
    </div>
  );
}

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [logged, setLogged] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which mobile accordion section is expanded (collapsed by default).
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the open burger. `position: fixed` rather than
  // `overflow: hidden` because iOS Safari ignores the latter, and the scroll
  // offset is restored on close so the page does not jump to the top.
  useEffect(() => {
    if (!mobileOpen) return;
    const y = window.scrollY;
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflowY: body.style.overflowY,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.overflowY = "scroll"; // keeps the scrollbar gutter, no width jump
    return () => {
      Object.assign(body.style, previous);
      window.scrollTo(0, y);
    };
  }, [mobileOpen]);

  // A resize past the lg breakpoint leaves the panel mounted but invisible,
  // with the body still locked. Close it when the desktop nav takes over.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const [streak, setStreak] = useState<number | null>(null);
  // Name shown under "account": the active child's name when reading as a
  // child, otherwise the parent's account name.
  const [accountName, setAccountName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setLogged(isLoggedIn());
    setIsAdmin(getRole() === "admin");
    // Streak chip: always visible. Show the active child's streak when reading
    // as a child, otherwise a general reading streak (anonymous or parent).
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
    try {
      const raw = localStorage.getItem(scopedKey("lunireve:streak"));
      setStreak(raw ? Number(raw) || 0 : 0);
    } catch {
      setStreak(0);
    }
    // Parent session: display name from the account info store, falling back
    // to the login username so the dropdown never shows "Mon compte" twice.
    try {
      const info = JSON.parse(localStorage.getItem(scopedKey("lunireve:accountInfo")) ?? "{}");
      if (info && typeof info.name === "string" && info.name.trim()) {
        setAccountName(info.name.trim());
        return;
      }
    } catch {
      /* ignore */
    }
    setAccountName(getUsername());
  }, []);

  // Cross-tab logout: when another tab logs out, drop the session UI here too.
  useEffect(() => {
    return onLogoutBroadcast(() => {
      setLogged(false);
      setIsAdmin(false);
      setAccountName(null);
      router.refresh();
    });
  }, [router]);

  async function onLogout() {
    await logout();
    broadcastLogout();
    setLogged(false);
    setIsAdmin(false);
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
            src="/logo-s.webp"
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

          {/* Combined Age + Length menu: ages stacked on the left, reading
              lengths on the right, each column with its own title. */}
          <NavDropdown label={t("nav.byAge")} contentClassName="min-w-0 w-max">
            <div className="grid grid-cols-[auto_auto] gap-x-3 p-1">
              <div className="min-w-[7.5rem]">
                <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-widest text-[var(--color-ink-400)]">
                  {t("nav.byAge")}
                </p>
                {AGE_RANGES.map((r) => (
                  <MenuLink key={r} href={{ pathname: "/histoires/age/[range]", params: { range: r } }}>
                    {ageLabel(r, locale)}
                  </MenuLink>
                ))}
              </div>
              <div className="border-l border-[var(--color-ink-100)] pl-3">
                <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-widest text-[var(--color-ink-400)]">
                  {t("nav.byDuration")}
                </p>
                {DURATION_BUCKETS.map((b) => (
                  <MenuLink key={b} href={{ pathname: "/histoires/duree/[bucket]", params: { bucket: b } }}>
                    {t(`durations.${b}`)}
                  </MenuLink>
                ))}
              </div>
            </div>
          </NavDropdown>

          {/* Create — the product's USP, given a filled background (#4) */}
          <Link
            href="/creer"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink-800)] px-4 py-2 text-sm font-medium text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] transition-colors"
          >
            <Wand2 className="h-4 w-4 text-[var(--color-create-icon)]" />
            {t("nav.create")}
          </Link>
        </nav>

        {/* Right side. Below lg only the theme toggle and the burger survive:
            the full cluster (streak, bell, search, language, account) measured
            334px on a 375px viewport and was what pushed the whole page into
            horizontal scroll. Everything hidden here reappears in the panel. */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {streak !== null && (
            <Link
              href="/histoires"
              title={t("nav.streakTitle")}
              className="hidden lg:inline-flex items-center gap-1 rounded-full bg-[var(--color-fox-300)]/25 px-2.5 py-1.5 text-xs font-medium text-[var(--color-fox-700)] hover:bg-[var(--color-fox-300)]/40"
            >
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </Link>
          )}
          {logged && (
            <span className="hidden lg:inline-flex">
              <NotificationBell />
            </span>
          )}
          <span className="hidden lg:inline-flex">
            <NavSearch />
          </span>
          <ThemeToggle />
          <span className="hidden lg:inline-flex">
            <LanguageSwitcher />
          </span>

          {logged && isAdmin ? (
            /* Admin on the public site: ONE clickable pill straight to the
               back-office — no user-profile dropdown (an admin account has no
               family area; each user only ever reaches their own profile). */
            <Link
              href={"/admin" as never}
              className="hidden lg:inline-flex items-center gap-2 rounded-full bg-[var(--color-ink-800)] px-4 py-2 text-sm font-medium text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[var(--color-mint-400)]" />
              <span className="flex flex-col items-start leading-tight text-left">
                <span className="text-[10px] uppercase tracking-wide text-[var(--color-indigo-soft-300)]">
                  Admin
                </span>
                <span className="-mt-0.5 text-sm font-medium">Tableau de bord</span>
              </span>
            </Link>
          ) : logged ? (
            <NavDropdown
              className="hidden lg:block"
              label={
                <span className="flex flex-col items-start leading-tight text-left">
                  <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-400)]">
                    {t("nav.account")}
                  </span>
                  <span className="-mt-0.5 max-w-[8rem] truncate text-sm font-medium">
                    {accountName ?? t("nav.account")}
                  </span>
                </span>
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
            <Button
              variant="primary"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={() => setAuthOpen(true)}
            >
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
          {/* Collapsible sections: tap a heading to reveal its options (#) */}
          <MobileSection id="stories" label={t("nav.stories")} open={mobileSection === "stories"} onToggle={setMobileSection}>
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
          </MobileSection>

          <MobileSection id="age" label={t("nav.byAge")} open={mobileSection === "age"} onToggle={setMobileSection}>
            {AGE_RANGES.map((r) => (
              <Link
                key={r}
                href={{ pathname: "/histoires/age/[range]", params: { range: r } }}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-[var(--color-ink-100)] px-3 py-1.5 text-xs text-[var(--color-ink-600)]"
              >
                {ageLabel(r, locale)}
              </Link>
            ))}
          </MobileSection>

          <MobileSection id="duration" label={t("nav.byDuration")} open={mobileSection === "duration"} onToggle={setMobileSection}>
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
          </MobileSection>

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
              <Wand2 className="h-4 w-4 text-[var(--color-create-icon)]" />
              {t("nav.create")}
            </Link>
          </div>

          {/* ---- Account. Deliberately a separate tinted block: everything
               above is "the library", everything below is "your account", and
               on mobile the two used to blur into one flat list. ---- */}
          <div className="mt-6 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-2">
            {logged && !isAdmin ? (
              <>
                <button
                  type="button"
                  aria-expanded={mobileSection === "account"}
                  onClick={() => setMobileSection(mobileSection === "account" ? null : "account")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink-800)] text-[var(--color-cream-50)]">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      {t("nav.account")}
                    </span>
                    <span className="truncate text-sm font-medium text-[var(--color-ink-800)]">
                      {accountName ?? t("nav.account")}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-[var(--color-ink-500)] transition-transform",
                      mobileSection === "account" && "rotate-180"
                    )}
                  />
                </button>
                {mobileSection === "account" && (
                  <div className="grid gap-0.5 border-t border-[var(--color-ink-100)] pt-2">
                    {[
                      { href: "/compte", label: t("nav.menuDashboard"), icon: LayoutDashboard },
                      { href: "/profils", label: t("nav.menuProfiles"), icon: Users },
                      { href: "/compte/histoires", label: t("account.menu.customStories"), icon: BookOpen },
                      { href: "/compte/favoris", label: t("account.menu.favorites"), icon: Sparkles },
                      { href: "/compte/abonnement", label: t("nav.pricing"), icon: Rocket },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href as never}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--color-ink-700)]"
                      >
                        <Icon className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        void onLogout();
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--color-ink-700)]"
                    >
                      <LogOut className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </>
            ) : logged && isAdmin ? (
              <div className="grid gap-0.5">
                <Link
                  href={"/admin" as never}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl bg-[var(--color-ink-800)] px-4 py-2.5 text-sm text-[var(--color-cream-50)]"
                >
                  <ShieldCheck className="h-4 w-4 text-[var(--color-mint-400)]" />
                  Espace admin
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void onLogout();
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--color-ink-700)]"
                >
                  <LogOut className="h-4 w-4 text-[var(--color-indigo-soft-500)]" />
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="w-full justify-center"
              >
                <User className="h-4 w-4" />
                {t("nav.authButton")}
              </Button>
            )}
          </div>

          {/* Search + language live in the navbar on desktop only, so they need
              a home here (the theme toggle stays in the bar itself). */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-ink-100)] pt-4">
            <NavSearch />
            <LanguageSwitcher />
          </div>
        </nav>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onLoggedIn={() => setLogged(true)} />
    </header>
  );
}
