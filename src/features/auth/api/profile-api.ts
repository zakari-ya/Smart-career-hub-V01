import { requireSupabaseBrowserClient } from "@/lib/supabase/client";

export type ProfileRecord = {
  id: string;
  email: string;
  fullName: string | null;
  hasPassword: boolean;
  authMethod: string;
};

export async function getCurrentProfile() {
  const client = requireSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id,email,full_name,has_password,auth_method")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    hasPassword: Boolean(data.has_password),
    authMethod: data.auth_method ?? "email_password"
  } satisfies ProfileRecord;
}
