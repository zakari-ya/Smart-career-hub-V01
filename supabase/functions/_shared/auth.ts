import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server configuration.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}

export function createUserClient(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase anon configuration.");
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: request.headers.get("Authorization") ?? ""
      }
    },
    auth: {
      persistSession: false
    }
  });
}

export async function getAuthenticatedUser(request: Request) {
  const userClient = createUserClient(request);
  const {
    data: { user },
    error
  } = await userClient.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required.");
  }

  return user;
}
