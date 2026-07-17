"use server";

import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  TEMP_CREDENTIALS,
  setSession,
  clearSession,
} from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isLoginBlocked,
  recordLoginFailure,
  clearLoginFailures,
} from "@/lib/auth/rateLimit";
import { ensureUserRow } from "@/db/users";
import { env } from "@/lib/env";

export type LoginState = {
  ok: boolean;
  role?: "admin" | "user";
  error?: boolean;
  message?: string;
  /** Signup succeeded but the account must be confirmed via the emailed link. */
  pendingConfirmation?: boolean;
};

/** Client IP behind Vercel's proxy (first hop of x-forwarded-for). */
async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/**
 * Strong-password rule (real accounts only — the temp test accounts keep
 * their 6-char passwords for quick testing until the pre-launch auth swap):
 * at least 10 characters with at least one letter and one digit.
 */
function isStrongPassword(pw: string): boolean {
  return pw.length >= 10 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
}

/** Anon-key client: signUp through it triggers Supabase's confirmation email. */
function getAnonClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars missing.");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Login — two paths (decision #21):
 * 1. Temp dev accounts (admin/123456, user/123456...) stay active for testing.
 * 2. Real Supabase email accounts (must have confirmed their email).
 * Rate limited: 5 failures / 15 min per identifier+IP (see lib/auth/rateLimit).
 */
export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "1";
  const ip = await clientIp();

  if (await isLoginBlocked(username, ip)) {
    return {
      ok: false,
      error: true,
      message:
        "Trop de tentatives. Réessayez dans une quinzaine de minutes.",
    };
  }

  // Path 1 — temp dev accounts
  const temp = TEMP_CREDENTIALS[username.toLowerCase()];
  if (temp && temp.password === password) {
    await clearLoginFailures(username, ip);
    await setSession(
      { role: temp.role, username: username.toLowerCase(), tier: temp.tier ?? "free" },
      remember
    );
    return { ok: true, role: temp.role };
  }

  // Path 2 — Supabase email accounts
  if (username.includes("@")) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username.toLowerCase(),
        password,
      });
      if (!error && data.user) {
        await clearLoginFailures(username, ip);
        // Backfill the shadow row in case the account predates it.
        await ensureUserRow({
          id: data.user.id,
          email: data.user.email ?? username,
          firstName:
            (data.user.user_metadata?.display_name as string | undefined) ?? null,
        });
        await setSession(
          { role: "user", username: data.user.email ?? username, userId: data.user.id },
          remember
        );
        return { ok: true, role: "user" };
      }
      if (error?.message.toLowerCase().includes("not confirmed")) {
        await recordLoginFailure(username, ip);
        return {
          ok: false,
          error: true,
          message:
            "Email non confirmé. Cliquez sur le lien reçu par email pour activer votre compte.",
        };
      }
    } catch (e) {
      console.error("[Lunireve] Supabase login failed:", e);
    }
  }

  await recordLoginFailure(username, ip);
  return { ok: false, error: true };
}

/**
 * Signup — creates a Supabase account through the anon client, which sends a
 * confirmation email. The user is NOT logged in until the link is clicked
 * (email verification is required before any generative action, brief §8).
 * Requires "Confirm email" to be enabled in Supabase Auth settings.
 */
export async function signup(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = formData.get("passwordConfirm");

  if (!email.includes("@") || name.length < 2) {
    return { ok: false, error: true };
  }
  if (!isStrongPassword(password)) {
    return {
      ok: false,
      error: true,
      message:
        "Mot de passe trop faible : 10 caractères minimum, avec au moins une lettre et un chiffre.",
    };
  }
  // Confirm field only present when the user typed their own password (#10)
  if (confirm !== null && confirm !== password) {
    return { ok: false, error: true, message: "Les mots de passe ne correspondent pas." };
  }

  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/connexion?confirmed=1`,
      },
    });
    if (error) {
      const exists = error.message.toLowerCase().includes("already");
      return {
        ok: false,
        error: true,
        message: exists ? "Un compte existe déjà avec cet email." : undefined,
      };
    }
    // Supabase signals an existing address by returning a user with no
    // identities instead of an error — don't leak that the account exists.
    if (data.user && (data.user.identities?.length ?? 0) > 0) {
      await ensureUserRow({ id: data.user.id, email, firstName: name });
    }
    return { ok: true, pendingConfirmation: true };
  } catch (e) {
    console.error("[Lunireve] Supabase signup failed:", e);
    return { ok: false, error: true };
  }
}

/**
 * OAuth bridge: the /auth/callback page exchanged the Google/Facebook PKCE
 * code client-side and hands us the Supabase access token. We verify it
 * server-side (never trust the client's word), ensure the shadow user row,
 * and mint our own HMAC cookie session, same as an email login.
 */
export async function loginWithOAuthToken(accessToken: string): Promise<LoginState> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) return { ok: false, error: true };
    const email = data.user.email ?? "";
    const meta = data.user.user_metadata ?? {};
    const displayName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      null;
    await ensureUserRow({
      id: data.user.id,
      email: email || data.user.id,
      firstName: displayName ? displayName.split(" ")[0] : null,
    });
    await setSession(
      { role: "user", username: email || data.user.id, userId: data.user.id },
      true
    );
    return { ok: true, role: "user" };
  } catch (e) {
    console.error("[Lunireve] OAuth login failed:", e);
    return { ok: false, error: true };
  }
}

export async function logout(): Promise<void> {
  await clearSession();
}
