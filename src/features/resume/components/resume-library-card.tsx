import { FileText } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/lib/utils";
import type { ResumeRecord } from "@/features/resume/types";

function formatFileType(fileType: string) {
  if (fileType.includes("pdf")) {
    return "PDF";
  }

  if (fileType.includes("markdown")) {
    return "MD";
  }

  if (fileType.includes("text/plain")) {
    return "TXT";
  }

  return fileType.toUpperCase();
}

type ResumeLibraryCardProps = {
  resumes: ResumeRecord[];
  isLoading?: boolean;
  errorMessage?: string;
};

export function ResumeLibraryCard({ resumes, isLoading, errorMessage }: ResumeLibraryCardProps) {
  return (
    <Card className="min-w-0 max-w-full">
      <CardDescription>Resume library</CardDescription>
      <CardTitle className="mt-2">Recent uploads</CardTitle>
      {isLoading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : errorMessage ? (
        <div className="mt-5 rounded-[22px] border border-[rgba(220,74,52,0.18)] bg-[rgba(220,74,52,0.06)] p-4 text-sm leading-6 text-[var(--color-danger-500)]">
          {errorMessage}
        </div>
      ) : resumes.length ? (
        <div className="mt-5 space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="grid min-w-0 gap-3 rounded-[22px] border border-black/6 bg-[var(--color-surface-100)] p-4 sm:flex sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-graphite-900)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-graphite-950)]">
                    {resume.title}
                  </p>
                  <p className="truncate text-xs text-[var(--color-graphite-700)]">
                    {formatFileType(resume.fileType)} • {resume.extractionStatus} • {formatRelativeDate(resume.createdAt)}
                  </p>
                  {resume.extractionStatus === "failed" && resume.extractionError ? (
                    <p className="mt-1 break-words text-xs leading-5 text-[var(--color-danger-500)]">
                      {resume.extractionError}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="text-xs font-medium text-[var(--color-graphite-700)] sm:shrink-0">
                {(resume.fileSize / 1024).toFixed(0)} KB
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-black/8 bg-[var(--color-surface-100)] p-4 text-sm leading-6 text-[var(--color-graphite-700)]">
          No resumes uploaded yet. Your secure upload history will appear here after the first analysis.
        </div>
      )}
    </Card>
  );
}
