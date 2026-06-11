"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { login, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FoxMark } from "@/components/brand/FoxCloud";

/**
 * TEMP login (dev) — admin/123456 → /admin, user/123456 → profile selector.
 * Swapped for Supabase Auth before launch; only the action changes.
 */
export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok) {
      router.push(state.role === "admin" ? ("/admin" as never) : "/profils");
    }
  }, [state, router]);

  return (
    <section className="mx-auto max-w-md px-5 py-16 md:py-24">
      <div className="text-center">
        <FoxMark className="mx-auto h-14 w-14" />
        <h1
          className="mt-6 font-serif text-3xl md:text-4xl tracking-tight"
          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'wght' 500" }}
        >
          {t("title")}
        </h1>
        <p className="mt-3 text-[var(--color-ink-500)]">{t("subtitle")}</p>
      </div>

      <form action={action} className="mt-10 space-y-5">
        <div>
          <Label htmlFor="username">{t("username")}</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-xl bg-[var(--color-fox-300)]/20 border border-[var(--color-fox-300)] px-4 py-2.5 text-sm text-[var(--color-fox-700)]">
            {t("error")}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={pending}
          className="w-full justify-center"
        >
          {pending ? t("pending") : t("submit")}
        </Button>

        <p className="text-center text-xs text-[var(--color-ink-400)]">{t("hint")}</p>
      </form>
    </section>
  );
}
