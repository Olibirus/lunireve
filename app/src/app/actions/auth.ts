"use server";

import {
  TEMP_CREDENTIALS,
  setSession,
  clearSession,
} from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type LoginState = {
  ok: boolean;
  role?: "admin" | "user";
  error?: boolean;
  message?: string;
};

/**
 * Login — two paths (decision #21):
 * 1. Temp dev accounts (admin/123456, user/123456) stay active for testing.
 * 2. Real Supabase email accounts (created via signup below).
 * The session itself stays our simple cookie for now; full Supabase session
 * management (refresh tokens, RLS-bound clients) is the pre-launch swap.
 */
export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Path 1 — temp dev accounts
  const temp = TEMP_CREDENTIALS[username.toLowerCase()];
  if (temp && temp.password === password) {
    await setSession({ role: temp.role, username: username.toLowerCase() });
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
        await setSession({ role: "user", username: data.user.email ?? username });
        return { ok: true, role: "user" };
      }
    } catch (e) {
      console.error("[Lunireve] Supabase login failed:", e);
    }
  }

  return { ok: false, error: true };
}

/**
 * Signup — creates a real Supabase account (email confirmed directly in V1;
 * email verification + Turnstile arrive with the anti-abuse batch).
 */
export async function signup(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@") || password.length < 8 || name.length < 2) {
    return { ok: false, error: true };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (error) {
      const exists = error.message.toLowerCase().includes("already");
      return {
        ok: false,
        error: true,
        message: exists ? "Un compte existe déjà avec cet email." : undefined,
      };
    }
    await setSession({ role: "user", username: data.user?.email ?? email });
    return { ok: true, role: "user" };
  } catch (e) {
    console.error("[Lunireve] Supabase signup failed:", e);
    return { ok: false, error: true };
  }
}

export async function logout(): Promise<void> {
  await clearSession();
}
