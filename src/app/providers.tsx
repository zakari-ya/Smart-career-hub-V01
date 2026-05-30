import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { AuthProvider } from "@/features/auth/components/auth-provider";
import { queryClient } from "@/lib/query-client";
import { PwaInstallListener } from "@/components/shared/pwa-install-listener";
import { Toaster } from "@/components/shared/toaster";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <PwaInstallListener />
      <Toaster />
    </QueryClientProvider>
  );
}
