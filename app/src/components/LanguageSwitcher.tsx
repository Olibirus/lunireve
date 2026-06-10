"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Locale switcher. Preserves pathname via next-intl's locale-aware router.
 * Styled as an inline ink-bordered pill — quiet, not shouting for attention.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("lang");
  const [pending, startTransition] = useTransition();

  function switchTo(nextLocale: string) {
    if (nextLocale === locale) return;
    startTransition(() => {
      // next-intl's typed router complains about dynamic pathnames here, but at
      // runtime the current pathname is already valid for the router. Cast to
      // loosen the param-inference check for locale switching only.
      router.replace(pathname as never, { locale: nextLocale as never });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/80 backdrop-blur p-0.5 text-xs font-medium",
        className
      )}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          disabled={pending}
          aria-label={`${t("switchLabel")}: ${t(l)}`}
          className={cn(
            "px-3 py-1.5 rounded-full tracking-wide transition-colors",
            locale === l
              ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
              : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
