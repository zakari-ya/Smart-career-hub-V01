import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/analysis/api/analysis-api";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
    refetchInterval: (query) =>
      query.state.data?.recentAnalyses.some((analysis) => analysis.status === "pending") ? 3000 : false
  });
}
