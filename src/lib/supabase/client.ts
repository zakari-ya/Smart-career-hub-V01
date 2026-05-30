import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env, getSupabaseConfigurationError, isSupabaseConfigured } from "@/lib/env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!client) {
    client = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return client;
}

export function requireSupabaseBrowserClient() {
  if (!isSupabaseConfigured) {
    throw getSupabaseConfigurationError();
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase client could not be created.");
  }

  return client;
}
