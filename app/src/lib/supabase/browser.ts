"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for client components. Reads public env vars that Next.js
 * inlines at build time. Lazy singleton so we don't construct a new client
 * on every render.
 */
let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase public env vars missing (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  client = createBrowserClient(url, anonKey);
  return client;
}
