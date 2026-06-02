import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadResume } from "@/features/resume/api/resume-api";

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["resumes"] }),
        queryClient.invalidateQueries({ queryKey: ["usage-limits"] })
      ]);
    }
  });
}
