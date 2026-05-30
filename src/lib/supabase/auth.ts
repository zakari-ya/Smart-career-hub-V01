import { getSupabaseBrowserClient, requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

function getAuthRedirectUrl() {
  return `${env.VITE_APP_URL.replace(/\/$/, "")}/auth/callback`;
}

export async function signInWithPassword(email: string, password: string) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  return { session: data.session, error };
}

async function requestSignupConfirmation(email: string) {
  const client = requireSupabaseBrowserClient();

  return client.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl()
    }
  });
}

async function requestExistingUserMagicLink(email: string) {
  const client = requireSupabaseBrowserClient();

  return client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser: false
    }
  });
}

export async function signUpWithPassword(email: string, password: string, fullName: string) {
  const client = requireSupabaseBrowserClient();

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        full_name: fullName
      }
    }
  });

  const status = data.session ? "signedIn" : "confirmationRequired";
  const confirmationSentAt =
    typeof data.user?.confirmation_sent_at === "string" ? data.user.confirmation_sent_at : null;
  let confirmationResendErrorMessage: string | null = null;
  let backupMagicLinkErrorMessage: string | null = null;
  let backupMagicLinkSent = false;

  if (!error && status === "confirmationRequired") {
    const { error: resendError } = await requestSignupConfirmation(email);
    confirmationResendErrorMessage = resendError?.message ?? null;

    const { error: magicLinkError } = await requestExistingUserMagicLink(email);
    backupMagicLinkErrorMessage = magicLinkError?.message ?? null;
    backupMagicLinkSent = !magicLinkError;
  }

  return {
    status,
    confirmationSentAt,
    confirmationResendErrorMessage,
    backupMagicLinkErrorMessage,
    backupMagicLinkSent,
    session: data.session,
    user: data.user,
    error
  };
}

export async function signInWithMagicLink(email: string) {
  const client = requireSupabaseBrowserClient();

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl()
    }
  });

  return { error };
}

export async function resendSignupConfirmation(email: string) {
  const [{ error: confirmationError }, { error: magicLinkError }] = await Promise.all([
    requestSignupConfirmation(email),
    requestExistingUserMagicLink(email)
  ]);

  return {
    error: confirmationError ?? magicLinkError,
    confirmationError,
    magicLinkError,
    backupMagicLinkSent: !magicLinkError
  };
}

export async function signOutUser() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return;
  }

  await client.auth.signOut();
}
