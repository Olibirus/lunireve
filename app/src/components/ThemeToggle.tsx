"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Light/dark toggle. The class on <html> is set before hydration by the
 * inline script in the locale layout, so we read it on mount rather than
 * guessing — avoids a hydration mismatch on the icon.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("theme");
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("lunireve-theme", next ? "dark" : "light");
    } catch {
      /* private mode — theme just won't persist */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t("toLight") : t("toDark")}
      title={dark ? t("toLight") : t("toDark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink-100)]",
        "bg-[var(--color-cream-50)]/80 backdrop-blur text-[var(--color-ink-500)]",
        "hover:text-[var(--color-ink-800)] hover:bg-[var(--color-cream-100)] transition-colors",
        className
      )}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
