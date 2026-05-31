import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { supabaseConfigurationMessage } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshSession, isConfigured } = useAuth();
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }

    const finishCallback = async () => {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const nextPath = getSafeNextPath(searchParams.get("next") ?? hashParams.get("next"));
      const authError =
        searchParams.get("error_description") ??
        hashParams.get("error_description") ??
        searchParams.get("error") ??
        hashParams.get("error");

      if (authError) {
        setCallbackError(authError);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);

        if (error) {
          setCallbackError(error.message);
          return;
        }
      }

      const { data, error } = await client.auth.getSession();

      if (error) {
        setCallbackError(error.message);
        return;
      }

      await refreshSession();
      navigate(data.session ? nextPath : "/login", { replace: true });
    };

    void finishCallback();
  }, [isConfigured, navigate, refreshSession]);

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardTitle>Authentication is not connected yet</CardTitle>
          <CardDescription className="mt-3 leading-7">
            {supabaseConfigurationMessage}
          </CardDescription>
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link to="/login">Back to login</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (callbackError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardTitle>We could not complete sign-in</CardTitle>
          <CardDescription className="mt-3 leading-7">{callbackError}</CardDescription>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="secondary">
              <Link to="/login">Back to login</Link>
            </Button>
            <Button asChild variant="teal">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardTitle>Completing your sign-in</CardTitle>
        <CardDescription className="mt-3">
          Securely finalizing your Smart Career Hub session.
        </CardDescription>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link to="/dashboard">Continue</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
