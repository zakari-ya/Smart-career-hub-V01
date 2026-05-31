import { useQuery } from "@tanstack/react-query";

import { getCurrentProfile } from "@/features/auth/api/profile-api";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function useCurrentProfile() {
  const { isAuthenticated, isConfigured, user } = useAuth();

  return useQuery({
    queryKey: ["current-profile", user?.id],
    queryFn: getCurrentProfile,
    enabled: isConfigured && isAuthenticated,
    staleTime: 30_000
  });
}
