import type { PropsWithChildren } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { supabaseConfigurationMessage } from "@/lib/env";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { loading, isAuthenticated, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardTitle>Preparing your workspace</CardTitle>
          <CardDescription className="mt-2">
            Loading Smart Career Hub and checking your session.
          </CardDescription>
        </Card>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg text-center">
          <CardTitle>Backend configuration required</CardTitle>
          <CardDescription className="mt-2 leading-7">
            {supabaseConfigurationMessage}
          </CardDescription>
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link to="/login">Return to login</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
