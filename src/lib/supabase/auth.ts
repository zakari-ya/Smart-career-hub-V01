import { getSupabaseBrowserClient, requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

function getAuthRedirectUrl() {
  return `${env.VITE_APP_URL.replace(/\/$/, "")}/auth/callback`;
}

function getPasswordResetRedirectUrl() {
  return `${getAuthRedirectUrl()}?next=/dashboard/set-password`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeCode(code: string) {
  return code.replace(/\D/g, "").slice(0, 6);
}

export async function signInWithPassword(email: string, password: string) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: normalizeEmail(email),
    password
  });

  if (!error && data.session) {
    await ensureCurrentUserProfile();
  }

  return { session: data.session, error };
}

async function requestSignupCode(email: string) {
  const client = requireSupabaseBrowserClient();

  return client.auth.resend({
    type: "signup",
    email: normalizeEmail(email),
    options: {
      emailRedirectTo: getAuthRedirectUrl()
    }
  });
}

async function ensureCurrentUserProfile() {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    return { error };
  }

  const fullName =
    typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : "";

  const { error: profileError } = await client.from("profiles").upsert(
    {
      id: data.user.id,
      email: data.user.email ?? "",
      full_name: fullName,
      has_password: true,
      auth_method: "email_password"
    },
    {
      onConflict: "id"
    }
  );

  return { error: profileError };
}

export async function signUpWithPassword(email: string, password: string, fullName: string) {
  const client = requireSupabaseBrowserClient();
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        full_name: fullName.trim(),
        has_password: true,
        auth_method: "email_password"
      }
    }
  });

  if (error && /already|registered|exists/i.test(error.message)) {
    return {
      status: "confirmationRequired" as const,
      email: normalizedEmail,
      confirmationSentAt: null,
      session: data.session,
      user: data.user,
      error: new Error("An account already exists with this email. Log in or reset your password.")
    };
  }

  if (!error && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      status: "confirmationRequired" as const,
      email: normalizedEmail,
      confirmationSentAt: null,
      session: null,
      user: data.user,
      error: new Error("An account already exists with this email. Log in or reset your password.")
    };
  }

  const status = data.session ? "signedIn" : "confirmationRequired";
  const confirmationSentAt =
    typeof data.user?.confirmation_sent_at === "string" ? data.user.confirmation_sent_at : null;

  if (!error && data.session) {
    await ensureCurrentUserProfile();
  }

  return {
    status,
    email: normalizedEmail,
    confirmationSentAt,
    session: data.session,
    user: data.user,
    error
  };
}

export async function signInWithMagicLink(email: string) {
  const client = requireSupabaseBrowserClient();

  const { error } = await client.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser: false
    }
  });

  if (error && /signup|signups|user not found|not found|invalid login/i.test(error.message)) {
    return {
      error: new Error("No account found with this email. Please create an account first.")
    };
  }

  return { error };
}

export async function resendSignupCode(email: string) {
  const { error } = await requestSignupCode(email);

  return { error };
}

export async function verifySignupCode(email: string, code: string) {
  const client = requireSupabaseBrowserClient();

  const { data, error } = await client.auth.verifyOtp({
    email: normalizeEmail(email),
    token: normalizeCode(code),
    type: "email"
  });

  if (error) {
    return { session: data.session, user: data.user, error };
  }

  const { error: profileError } = await ensureCurrentUserProfile();

  return {
    session: data.session,
    user: data.user,
    error: profileError
  };
}

export async function sendPasswordResetEmail(email: string) {
  const client = requireSupabaseBrowserClient();

  const { error } = await client.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: getPasswordResetRedirectUrl()
  });

  return { error };
}

export async function setCurrentUserPassword(password: string) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.updateUser({ password });

  if (error) {
    return { user: data.user, error };
  }

  const { error: profileError } = await ensureCurrentUserProfile();

  return {
    user: data.user,
    error: profileError
  };
}

export async function signOutUser() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return;
  }

  await client.auth.signOut();
}
