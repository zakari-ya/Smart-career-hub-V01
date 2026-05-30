import { useQuery } from "@tanstack/react-query";

import { getAnalysisById } from "@/features/analysis/api/analysis-api";

export function useResumeAnalysis(analysisId: string) {
  return useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: () => getAnalysisById(analysisId),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 3000 : false)
  });
}
