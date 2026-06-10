import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role Supabase client. NEVER import this from client code — it bypasses RLS.
 * The `server-only` import guards against accidental inclusion in client bundles.
 *
 * Use for: admin mutations (assigning subscription status after Stripe webhook,
 * uploading generated story assets, running cron jobs).
 */
let adminClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Admin Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  adminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  return adminClient;
}
