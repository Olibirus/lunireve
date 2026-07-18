import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cookie session with HMAC signing.
 *
 * The payload is JSON but every cookie carries an HMAC-SHA256 signature over
 * it, keyed by SESSION_SECRET. Without the secret a forged cookie fails
 * verification — critical because a session is what gates the paid AI
 * generation actions (text/image/audio credits).
 *
 * Temp credentials (admin/user/123456) remain for testing only; the full
 * Supabase Auth session swap replaces them before public launch.
 */

// Server-only secret. The dev fallback keeps local work friction-free; in
// production SESSION_SECRET must be set (a missing one is logged loudly).
const SECRET = process.env.SESSION_SECRET ?? "lunireve-dev-secret-not-for-prod";
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "[Lunireve] SESSION_SECRET is not set in production — sessions are signed with the known dev fallback. Set it NOW."
  );
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

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
    // Format: base64url(json) + "." + hmac. Anything else is rejected —
    // including old unsigned cookies (those users simply log in again).
    const dot = raw.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = raw.slice(0, dot);
    const signature = raw.slice(dot + 1);
    if (!verify(payload, signature)) return null;

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Session;
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
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
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
  // Account id used to namespace every client store (lib/userScope.ts) so one
  // account's profiles/favorites/etc never leak to another login on the device.
  store.set("lunireve_user", encodeURIComponent(session.username), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  // Stable per-account storage namespace: the Supabase user id when present.
  // lib/userScope prefers it over the email, so local data follows the account
  // through OAuth identity linking but never survives a deletion followed by a
  // re-registration of the same email (new signup = new id = fresh bucket).
  if (session.userId) {
    store.set("lunireve_uid", session.userId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  } else {
    store.delete("lunireve_uid");
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
  store.delete("lunireve_role");
  store.delete("lunireve_tier");
  store.delete("lunireve_user");
  store.delete("lunireve_uid");
}
