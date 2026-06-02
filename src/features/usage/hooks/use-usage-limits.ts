import { useQuery } from "@tanstack/react-query";

import { getUsageLimits } from "@/features/usage/api/usage-api";

export function useUsageLimits(enabled = true) {
  return useQuery({
    queryKey: ["usage-limits"],
    queryFn: getUsageLimits,
    enabled,
    staleTime: 60_000
  });
}
