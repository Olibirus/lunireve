"use server";

import {
  TEMP_CREDENTIALS,
  setSession,
  clearSession,
} from "@/lib/auth/session";

export type LoginState = {
  ok: boolean;
  role?: "admin" | "user";
  error?: boolean;
};

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const match = TEMP_CREDENTIALS[username];
  if (!match || match.password !== password) {
    return { ok: false, error: true };
  }

  await setSession({ role: match.role, username });
  return { ok: true, role: match.role };
}

export async function logout(): Promise<void> {
  await clearSession();
}
