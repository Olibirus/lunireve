"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { loginWithOAuthToken } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

/**
 * OAuth landing (Google / Facebook return here with ?code=...). The browser
 * client exchanges the PKCE code, then the access token is verified
 * server-side and bridged into our HMAC cookie session; the local Supabase
 * session is discarded. On success: straight to the profile selector.
 */
export default function OAuthCallbackPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        // detectSessionInUrl may have already exchanged the code on init.
        let session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          const code = new URLSearchParams(window.location.search).get("code");
          if (!code) throw new Error("missing code");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error || !data.session) throw error ?? new Error("no session");
          session = data.session;
        }
        const res = await loginWithOAuthToken(session.access_token);
        if (!res.ok) throw new Error("bridge rejected");
        // Our cookie session now drives the app; drop the local one.
        await supabase.auth.signOut({ scope: "local" });
        if (!cancelled) router.replace("/profils");
      } catch (e) {
        console.error("[Lunireve] OAuth callback failed:", e);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-md px-5 py-24 text-center">
      {failed ? (
        <>
          <p className="text-sm text-[var(--color-fox-700)]">{t("oauthError")}</p>
          <Link
            href="/connexion"
            className="mt-6 inline-block rounded-xl bg-[var(--color-ink-800)] px-5 py-2.5 text-sm text-[var(--color-cream-50)] hover:bg-[var(--color-ink-700)]"
          >
            {t("title")}
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-indigo-soft-500)]" />
          <p className="mt-4 text-sm text-[var(--color-ink-500)]">{t("oauthWorking")}</p>
        </>
      )}
    </section>
  );
}
