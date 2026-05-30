import { CheckCircle2, FileUp, Loader2, LockKeyhole, Sparkles, TextSearch, TriangleAlert } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UploadPhase } from "@/features/resume/types";

type UploadPipelineCardProps = {
  phase: UploadPhase;
  fileName?: string;
  errorMessage?: string;
};

const phaseMeta: Record<
  UploadPhase,
  {
    label: string;
    progress: number;
    copy: string;
    activeStep: number;
  }
> = {
  idle: {
    label: "Ready",
    progress: 6,
    copy: "Choose a file. We will show every backend step here.",
    activeStep: 0
  },
  uploading: {
    label: "Uploading",
    progress: 26,
    copy: "Your resume is moving to private Supabase Storage.",
    activeStep: 1
  },
  extracting: {
    label: "Extracting",
    progress: 56,
    copy: "The Edge Function is checking ownership and reading clean resume text.",
    activeStep: 2
  },
  analyzing: {
    label: "AI analyzing",
    progress: 84,
    copy: "OpenRouter is reviewing your CV server-side. We validate JSON before saving.",
    activeStep: 3
  },
  completed: {
    label: "Ready",
    progress: 100,
    copy: "Your analytics dashboard is ready. Opening the result now.",
    activeStep: 4
  },
  failed: {
    label: "Stopped safely",
    progress: 100,
    copy: "The pipeline stopped without exposing private data. Fix the issue and try again.",
    activeStep: 0
  }
};

const steps = [
  {
    title: "Private upload",
    detail: "File stored securely",
    icon: FileUp
  },
  {
    title: "Text extraction",
    detail: "PDF/TXT/MD parsed",
    icon: TextSearch
  },
  {
    title: "AI review",
    detail: "Coach + ATS scan",
    icon: Sparkles
  },
  {
    title: "Dashboard",
    detail: "Scores saved",
    icon: CheckCircle2
  }
] as const;

export function UploadPipelineCard({ phase, fileName, errorMessage }: UploadPipelineCardProps) {
  const meta = phaseMeta[phase];
  const isWorking = phase === "uploading" || phase === "extracting" || phase === "analyzing";
  const isFailed = phase === "failed";

  return (
    <Card className="relative min-w-0 max-w-full overflow-hidden rounded-[34px] bg-white/76">
      <div className="absolute right-[-18%] top-[-24%] h-48 w-48 rounded-full bg-[rgba(18,183,166,0.12)] blur-[54px]" />
      <div className="relative min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription>Live backend pipeline</CardDescription>
            <CardTitle className="mt-2 text-2xl">What is happening now</CardTitle>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              isFailed
                ? "bg-[rgba(220,74,52,0.1)] text-[var(--color-danger-500)]"
                : "bg-[var(--color-graphite-950)] text-white"
            )}
          >
            {isFailed ? (
              <TriangleAlert className="h-5 w-5" />
            ) : isWorking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LockKeyhole className="h-5 w-5" />
            )}
          </div>
        </div>

        <div className="mt-5 min-w-0 rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold text-[var(--color-graphite-950)]">
              {fileName ? fileName : "No file selected"}
            </span>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--color-graphite-700)]">
              {meta.label}
            </span>
          </div>
          <Progress value={meta.progress} />
          <p className="mt-3 text-sm leading-6 text-[var(--color-graphite-700)]">{meta.copy}</p>
        </div>

        <div className="mt-5 grid gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepNumber = index + 1;
            const isComplete = phase === "completed" || stepNumber < meta.activeStep;
            const isActive = stepNumber === meta.activeStep && isWorking;

            return (
              <div
                key={step.title}
                className={cn(
                "flex min-w-0 items-center gap-3 rounded-[22px] border px-4 py-3",
                  isComplete
                    ? "border-[rgba(18,183,166,0.22)] bg-[rgba(18,183,166,0.08)]"
                    : isActive
                      ? "border-[rgba(18,183,166,0.28)] bg-white shadow-[0_14px_40px_rgba(15,23,32,0.07)]"
                      : "border-black/6 bg-[var(--color-surface-100)]"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                    isComplete || isActive
                      ? "bg-[var(--color-teal-500)] text-[var(--color-graphite-950)]"
                      : "bg-white text-[var(--color-graphite-700)]"
                  )}
                >
                  {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-graphite-950)]">{step.title}</p>
                  <p className="truncate text-xs text-[var(--color-graphite-700)]">{step.detail}</p>
                </div>
                {isComplete ? <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-[var(--color-teal-500)]" /> : null}
              </div>
            );
          })}
        </div>

        {phase === "analyzing" ? (
          <div className="mt-5 overflow-hidden rounded-[24px] border border-[rgba(18,183,166,0.2)] bg-[rgba(18,183,166,0.08)] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-graphite-950)] text-white">
                <Sparkles className="h-4 w-4" />
                <span className="absolute inset-0 animate-ping rounded-2xl bg-[rgba(18,183,166,0.28)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-graphite-950)]">AI is reading your resume now</p>
                <p className="text-xs leading-5 text-[var(--color-graphite-700)]">
                  It checks clarity, ATS fit, keywords, impact, and action steps.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "failed" && errorMessage ? (
          <div className="mt-5 rounded-[20px] border border-[rgba(220,74,52,0.18)] bg-[rgba(220,74,52,0.06)] px-4 py-3 text-sm leading-6 text-[var(--color-danger-500)]">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
