import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Uses Next.js 16's async `cookies()` API. Writing cookies from a Server Component
 * will throw — that's expected; Supabase's SSR helper catches it silently. Cookie
 * writes only work from Server Actions / Route Handlers, where the response stream
 * hasn't started yet.
 */
export async function getSupabaseServerClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — ignore. Middleware/proxy.ts keeps
            // the session fresh, so missing writes here are non-fatal.
          }
        },
      },
    }
  );
}
