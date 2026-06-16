"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Translate the current URL path from one locale to another using the
 * configured pathname map, including dynamic segments. Done manually so it
 * works reliably for every route (incl. story pages), instead of relying on
 * the typed router which can't translate a concrete dynamic path from a string.
 */
function translatePath(externalPath: string, fromLoc: string, toLoc: string): string {
  for (const value of Object.values(routing.pathnames)) {
    const fromPat = typeof value === "string" ? value : (value as Record<string, string>)[fromLoc];
    const toPat = typeof value === "string" ? value : (value as Record<string, string>)[toLoc];
    if (!fromPat || !toPat) continue;
    const names: string[] = [];
    const regex = new RegExp(
      "^" + fromPat.replace(/\[(\w+)\]/g, (_m, n) => { names.push(n); return "([^/]+)"; }) + "$"
    );
    const match = externalPath.match(regex);
    if (match) {
      let target = toPat;
      names.forEach((n, i) => { target = target.replace(`[${n}]`, match[i + 1]); });
      return target;
    }
  }
  return externalPath;
}

/**
 * Compact locale switcher (feedback #26): shows only the current locale
 * ("FR") as a small pill; click or hover opens a mini dropdown with the
 * other languages. Scales to ES and beyond without eating navbar space.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("lang");
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function switchTo(nextLocale: string) {
    setOpen(false);
    if (nextLocale === locale) return;
    const { pathname, search, hash } = window.location;
    const prefix = `/${locale}`;
    // Strip the current locale prefix to get the external path in this locale.
    let ext = pathname;
    if (locale !== routing.defaultLocale && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      ext = pathname.slice(prefix.length) || "/";
    }
    const translated = translatePath(ext, locale, nextLocale);
    const base = nextLocale === routing.defaultLocale ? "" : `/${nextLocale}`;
    const target = `${base}${translated === "/" ? "" : translated}` || "/";
    startTransition(() => {
      router.replace(`${target}${search}${hash}`);
    });
  }

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={t("switchLabel")}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border border-[var(--color-ink-100)]",
          "bg-[var(--color-cream-50)]/80 backdrop-blur px-3 text-xs font-medium tracking-wide",
          "text-[var(--color-ink-600)] hover:text-[var(--color-ink-800)] hover:bg-[var(--color-cream-100)]"
        )}
      >
        {locale.toUpperCase()}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 pt-1.5">
          <div className="min-w-32 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-1.5 shadow-[var(--shadow-float)]">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchTo(l)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs",
                  l === locale
                    ? "bg-[var(--color-cream-200)] text-[var(--color-ink-800)]"
                    : "text-[var(--color-ink-600)] hover:bg-[var(--color-cream-100)]"
                )}
              >
                {t(l)}
                <span className="font-medium">{l.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
