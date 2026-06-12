"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Compact locale switcher (feedback #26): shows only the current locale
 * ("FR") as a small pill; click or hover opens a mini dropdown with the
 * other languages. Scales to ES and beyond without eating navbar space.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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
    startTransition(() => {
      // next-intl's typed router can't infer dynamic pathnames here, but the
      // current pathname is always valid at runtime — loosen for the switch.
      router.replace(pathname as never, { locale: nextLocale as never });
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
