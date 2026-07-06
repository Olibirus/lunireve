import { z } from "zod";

/**
 * Centralized, type-safe environment variable access.
 *
 * Why this matters: every provider (Supabase, Stripe, Anthropic, OpenAI, ElevenLabs,
 * Gelato, Brevo) has its own env keys. A missing key at runtime is a production outage.
 * We validate everything up-front so misconfiguration fails fast at boot, not on first request.
 *
 * Server-only keys NEVER have the NEXT_PUBLIC_ prefix. Only public keys do.
 */

const serverSchema = z.object({
  // --- Node ---
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // --- Database (Supabase Postgres) ---
  // DATABASE_URL = pooled connection (port 6543, transaction mode) for app runtime.
  // DIRECT_DATABASE_URL = direct connection (port 5432) for migrations only.
  DATABASE_URL: z.string().url().optional(),
  DIRECT_DATABASE_URL: z.string().url().optional(),

  // --- Supabase ---
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // --- Session signing (HMAC key for the auth cookie; ≥32 chars) ---
  SESSION_SECRET: z.string().min(32).optional(),

  // --- AI providers (all optional at boot — required at call site) ---
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),

  // --- Provider selection (lets us swap without code changes) ---
  TEXT_PROVIDER: z.enum(["anthropic", "openai"]).default("anthropic"),
  IMAGE_PROVIDER_LIBRARY: z.enum(["openai", "replicate"]).default("openai"),
  IMAGE_PROVIDER_PERSONALIZED: z
    .enum(["openai", "replicate"])
    .default("openai"),
  AUDIO_PROVIDER_LIBRARY: z.enum(["openai", "elevenlabs"]).default("openai"),
  AUDIO_PROVIDER_PERSONALIZED: z
    .enum(["openai", "elevenlabs"])
    .default("elevenlabs"),

  // --- Payments ---
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // --- Email ---
  BREVO_API_KEY: z.string().optional(),

  // --- Print-on-demand (Phase 3) ---
  GELATO_API_KEY: z.string().optional(),

  // --- App ---
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

export function getPublicEnv() {
  return clientSchema.parse(process.env);
}
