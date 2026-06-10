"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FoxMark } from "@/components/brand/FoxCloud";
import { RotateCcw, Home } from "lucide-react";

/**
 * Locale-scoped error boundary. Must be a client component per Next.js 16.
 * We log in dev for visibility, but keep the user-facing copy warm and
 * reassuring — children's brand, not an ops dashboard.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[Lunireve] Route error:", error);
    }
  }, [error]);

  return (
    <section className="relative mx-auto max-w-2xl px-5 md:px-8 py-24 md:py-32 text-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-4 py-2 text-xs tracking-widest uppercase text-[var(--color-ink-500)]">
        <FoxMark className="h-6 w-6" />
        {t("kicker")}
      </div>

      <h1
        className="mt-8 font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight"
        style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
      >
        {t("title")}
      </h1>
      <p className="mt-5 text-[var(--color-ink-500)] leading-relaxed max-w-md mx-auto">
        {t("body")}
      </p>

      {error.digest && (
        <p className="mt-4 text-xs text-[var(--color-ink-400)] font-mono">
          {t("reference")}: {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          {t("retry")}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="h-4 w-4" />
            {t("home")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
