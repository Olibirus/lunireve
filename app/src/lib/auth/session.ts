import { cookies } from "next/headers";

/**
 * TEMPORARY auth — dev/testing only (brief decision #30).
 *
 * Hardcoded credentials, plain cookie session:
 *   admin / 123456 → role "admin"
 *   user  / 123456 → role "user"
 *
 * Replaced by Supabase Auth before public launch. Nothing here is secure
 * and nothing pretends to be — do NOT ship this to production.
 */

export type Session = { role: "admin" | "user"; username: string };

const COOKIE = "lunireve_session";

export const TEMP_CREDENTIALS: Record<string, { password: string; role: Session["role"] }> = {
  admin: { password: "123456", role: "admin" },
  user: { password: "123456", role: "user" },
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (parsed.role === "admin" || parsed.role === "user") return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
