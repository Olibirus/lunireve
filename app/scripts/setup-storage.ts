/**
 * Idempotently create the public Supabase Storage buckets the app writes
 * generated assets to. Safe to re-run: existing buckets are ensured public.
 *
 *   pnpm storage:setup
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (loaded from
 * .env.local by the npm script). Service-role key required — bucket admin.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Must match STORAGE_BUCKETS in src/lib/supabase/storage.ts.
const BUCKETS = ["story-images", "story-audio", "character-references"];

async function main() {
  for (const name of BUCKETS) {
    const { error } = await supabase.storage.createBucket(name, { public: true });
    if (error) {
      // Already-exists is fine; just make sure it is public.
      const { error: updateError } = await supabase.storage.updateBucket(name, {
        public: true,
      });
      if (updateError) {
        console.error(`✗ ${name}: ${error.message} / ${updateError.message}`);
        process.exitCode = 1;
        continue;
      }
      console.log(`• ${name}: already existed, ensured public`);
      continue;
    }
    console.log(`✓ ${name}: created (public)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
