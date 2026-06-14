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

export type Tier = "free" | "plus" | "max";

export type Session = {
  role: "admin" | "user";
  username: string;
  /**
   * Subscription tier — drives client quotas (personalized stories per month)
   * and UI gates. Defaults to "free" if missing. Real accounts will derive
   * this from Supabase once Stripe lands in V2; for now it is hardcoded on
   * the temp test accounts so we can exercise paid-tier behavior end to end.
   */
  tier?: Tier;
  /**
   * Supabase auth.users id, present only for real email accounts (not the temp
   * admin/user logins). DB-backed features key off this — server actions that
   * write user-owned rows require it and no-op gracefully when it is absent.
   */
  userId?: string;
};

/** The Supabase user uuid for the current session, or null for temp accounts. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

const COOKIE = "lunireve_session";

export const TEMP_CREDENTIALS: Record<
  string,
  { password: string; role: Session["role"]; tier?: Tier }
> = {
  admin: { password: "123456", role: "admin" },
  user: { password: "123456", role: "user", tier: "free" },
  user2: { password: "123456", role: "user", tier: "plus" },
  user3: { password: "123456", role: "user", tier: "max" },
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

export async function setSession(session: Session, remember = true) {
  const store = await cookies();
  // remember = true → 30-day persistent cookie; false → session cookie
  // (cleared when the browser closes), by omitting maxAge.
  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined;
  store.set(COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  // Non-httpOnly companion: lets client components gate UI (ratings, likes)
  // without an API roundtrip. Carries the role only — no secrets.
  store.set("lunireve_role", session.role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  // Same idea for the tier — client-side quota helpers read it directly.
  store.set("lunireve_tier", session.tier ?? "free", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
  store.delete("lunireve_role");
  store.delete("lunireve_tier");
}
