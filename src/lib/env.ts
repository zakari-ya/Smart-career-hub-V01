import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  VITE_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  VITE_APP_URL: z.string().url().optional().default("http://localhost:5173")
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.warn("Environment validation failed.", parsed.error.flatten());
}

export const env = parsed.success
  ? parsed.data
  : {
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_ANON_KEY: "",
      VITE_APP_URL: "http://localhost:5173"
    };

export const isSupabaseConfigured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);

export const supabaseConfigurationMessage =
  "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect authentication, storage, and analysis.";

export function getSupabaseConfigurationError() {
  return new Error(supabaseConfigurationMessage);
}
