import { useQuery } from "@tanstack/react-query";

import { listResumes } from "@/features/resume/api/resume-api";

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes
  });
}
