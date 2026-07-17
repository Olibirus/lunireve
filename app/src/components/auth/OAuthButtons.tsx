"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Social sign-in (#10) — real Supabase OAuth (PKCE). Clicking a provider
 * redirects to Google/Facebook, which returns to /auth/callback where the
 * code is exchanged and bridged into our cookie session.
 *
 * Requires the provider to be ENABLED in the Supabase dashboard
 * (Authentication > Providers) with its OAuth app credentials; until then
 * the click surfaces a friendly error instead of failing silently.
 */
export function OAuthButtons() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [busy, setBusy] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState(false);

  async function oauth(provider: "google" | "facebook") {
    setError(false);
    setBusy(provider);
    try {
      const supabase = getSupabaseBrowserClient();
      const callbackPath = locale === "en" ? "/en/auth/callback" : "/auth/callback";
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${callbackPath}` },
      });
      // On success the browser navigates away; reaching here means failure.
      if (error) {
        console.error("[Lunireve] OAuth start failed:", error.message);
        setError(true);
        setBusy(null);
      }
    } catch (e) {
      console.error("[Lunireve] OAuth start failed:", e);
      setError(true);
      setBusy(null);
    }
  }

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] px-3 py-2.5 text-sm hover:bg-[var(--color-cream-100)] disabled:opacity-60";

  return (
    <div>
      <div className="flex items-center gap-3 my-1">
        <span className="h-px flex-1 bg-[var(--color-ink-100)]" />
        <span className="text-xs text-[var(--color-ink-400)]">{t("orContinue")}</span>
        <span className="h-px flex-1 bg-[var(--color-ink-100)]" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => oauth("google")} disabled={busy !== null} className={btn}>
          {busy === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
          )}
          Google
        </button>
        <button type="button" onClick={() => oauth("facebook")} disabled={busy !== null} className={btn}>
          {busy === "facebook" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z" />
            </svg>
          )}
          Facebook
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-[var(--color-fox-700)]">
          {t("oauthError")}
        </p>
      )}
    </div>
  );
}
